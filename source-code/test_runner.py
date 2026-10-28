#!/usr/bin/env python3
"""
Automated Test Runner for MassSpaceForge Pro v1.0.0
Validates 10 Core Physical & Normative ECSS-E-ST-10-02C & ISO 22010:2020 Requirements
"""

import unittest
from massspace_cli import (
    calc_subsystem_masses,
    calc_com,
    calc_inertia,
    evaluate_mass_budget,
    MISSION_PRESETS
)

class TestMassSpaceForgePro(unittest.TestCase):

    def test_01_dml_maturity_margin_factors(self):
        """Test 01: Verify DML maturity margin scaling (DML 1=20%, DML 4=5%, DML 5=2%)"""
        subs = [
            {"id": "S1", "name": "Concept Sub", "subsystem": "Struct", "nominal_mass_kg": 100.0, "dml": "DML_1"},
            {"id": "S2", "name": "Off-Shelf Sub", "subsystem": "Avionics", "nominal_mass_kg": 100.0, "dml": "DML_5"}
        ]
        res = calc_subsystem_masses(subs)
        self.assertEqual(res[0]["predicted_kg"], 120.0) # +20%
        self.assertEqual(res[1]["predicted_kg"], 102.0) # +2%

    def test_02_system_growth_margin_rollup(self):
        """Test 02: Verify system growth margin (+10% reserve) applied to predicted dry mass"""
        cfg = MISSION_PRESETS["falcon9_rideshare_smallsat"]
        res = evaluate_mass_budget(cfg)
        self.assertAlmostEqual(res["dry_design_kg"], res["dry_predicted_kg"] * 1.10, delta=0.5)

    def test_03_launch_vehicle_lift_margin(self):
        """Test 03: Verify Launch Vehicle lift capability margin >= +10.0% across all presets"""
        for preset_key in ["falcon9_rideshare_smallsat", "leo_constellation_node", "geo_telecom_flagship"]:
            cfg = MISSION_PRESETS[preset_key]
            res = evaluate_mass_budget(cfg)
            self.assertGreaterEqual(res["launch_vehicle_margin_pct"], 10.0)
            self.assertGreater(res["launch_vehicle_margin_kg"], 0.0)

    def test_04_center_of_mass_synthesis(self):
        """Test 04: Verify 3D Center of Mass synthesis"""
        items = [
            {"predicted_kg": 50.0, "pos_x_mm": 10.0, "pos_y_mm": 0.0, "pos_z_mm": 200.0},
            {"predicted_kg": 50.0, "pos_x_mm": -10.0, "pos_y_mm": 0.0, "pos_z_mm": 400.0}
        ]
        com = calc_com(items)
        self.assertEqual(com["x_com_mm"], 0.0)
        self.assertEqual(com["y_com_mm"], 0.0)
        self.assertEqual(com["z_com_mm"], 300.0)
        self.assertEqual(com["lateral_offset_mm"], 0.0)

    def test_05_lateral_com_offset_limit(self):
        """Test 05: Verify lateral CoM offset within allowable clampband envelope"""
        cfg = MISSION_PRESETS["falcon9_rideshare_smallsat"]
        res = evaluate_mass_budget(cfg)
        self.assertLessEqual(res["com"]["lateral_offset_mm"], cfg["max_lateral_offset_mm"])

    def test_06_parallel_axis_theorem_inertia(self):
        """Test 06: Verify parallel axis theorem (I = I_local + m*d^2)"""
        items = [
            {"predicted_kg": 10.0, "pos_x_mm": 0.0, "pos_y_mm": 1000.0, "pos_z_mm": 0.0, "ixx": 1.0, "iyy": 1.0, "izz": 1.0}
        ]
        com = calc_com(items)
        # Point mass at CoM has zero distance to CoM, so translated I should equal local
        ine = calc_inertia(items, com)
        self.assertEqual(ine["ixx_kg_m2"], 1.0)

    def test_07_principal_axis_tilt_angle(self):
        """Test 07: Verify principal axis tilt angle <= 0.50 deg for balanced spacecraft"""
        cfg = MISSION_PRESETS["falcon9_rideshare_smallsat"]
        res = evaluate_mass_budget(cfg)
        self.assertLessEqual(res["inertia"]["principal_axis_tilt_deg"], 0.50)

    def test_08_inertia_tensor_positive_definite(self):
        """Test 08: Verify inertia tensor determinant > 0 and positive definiteness"""
        for preset_key in ["falcon9_rideshare_smallsat", "leo_constellation_node", "geo_telecom_flagship"]:
            cfg = MISSION_PRESETS[preset_key]
            res = evaluate_mass_budget(cfg)
            self.assertTrue(res["inertia"]["positive_definite"])
            self.assertGreater(res["inertia"]["determinant"], 0.0)

    def test_09_propellant_trapped_residuals(self):
        """Test 09: Verify propellant trapped residual accounting >= 1.5%"""
        cfg = MISSION_PRESETS["falcon9_rideshare_smallsat"]
        fraction = (cfg["residual_propellant_kg"] / cfg["usable_propellant_kg"]) * 100.0
        self.assertGreaterEqual(fraction, 1.5)

    def test_10_negative_margin_sensitivity(self):
        """Test 10: Verify that an overloaded spacecraft fails LV lift margin (< 10%)"""
        cfg = {
            "name": "Overweight Spacecraft",
            "launch_vehicle_capability_kg": 200.0,
            "system_growth_margin_pct": 10.0,
            "usable_propellant_kg": 50.0,
            "residual_propellant_kg": 1.0,
            "pressurant_kg": 0.5,
            "max_lateral_offset_mm": 10.0,
            "subsystems": [
                {"id": "S1", "name": "Heavy Payload", "subsystem": "Payload", "nominal_mass_kg": 180.0, "dml": "DML_1", "pos_x_mm": 50.0, "pos_y_mm": 50.0, "pos_z_mm": 500.0, "ixx": 5.0, "iyy": 5.0, "izz": 8.0}
            ]
        }
        res = evaluate_mass_budget(cfg)
        self.assertLess(res["launch_vehicle_margin_pct"], 10.0)
        self.assertGreater(res["com"]["lateral_offset_mm"], 10.0)

if __name__ == "__main__":
    unittest.main()
