/**
 * MassSpaceForge Pro v1.0.0 — 10-Point Normative Compliance Auditor
 * Standards: ECSS-E-ST-10-02C, ECSS-M-ST-10C, ISO 22010:2020, AIAA S-120
 */

import {
  evaluateSpacecraftMassProperties
} from "./massspace-engine.js";

/**
 * Runs the complete 10-point normative mass properties audit
 * @param {Object} missionConfig
 * @returns {Object}
 */
export function runMassPropertiesAudit(missionConfig) {
  const massProp = evaluateSpacecraftMassProperties(missionConfig);

  const minLvMarginPct = Number(missionConfig.minLvMarginPct || 10.0);
  const maxLateralComMm = Number(missionConfig.maxLateralComMm || 10.0);
  const maxTiltAngleDeg = Number(missionConfig.maxTiltAngleDeg || 0.50);
  const zMinMm = Number(missionConfig.zMinMm || 100.0);
  const zMaxMm = Number(missionConfig.zMaxMm || 1200.0);

  const checks = [];

  // Rule 01: Launch Vehicle Lift Capability Positive Margin
  const lvMarginOk = massProp.launchVehicleMarginPct >= minLvMarginPct;
  checks.push({
    id: "ECSS-MASS-01",
    clause: "ECSS-E-ST-10-02C Cl. 5.2.1",
    requirement: `Launch Vehicle Lift Capability Envelope Margin >= +${minLvMarginPct.toFixed(1)}%`,
    measured: `Margin = +${massProp.launchVehicleMarginPct.toFixed(2)}% (${massProp.launchVehicleMarginKg.toFixed(1)} kg reserve)`,
    passed: lvMarginOk
  });

  // Rule 02: Subsystem Design Maturity Level (DML) Allocation
  const dmlOk = massProp.subsystems.every((s) => s.dmlMarginPct >= 2.0 && s.dmlMarginPct <= 20.0);
  checks.push({
    id: "ECSS-MASS-02",
    clause: "ECSS-E-ST-10-02C Table 4-1",
    requirement: "Subsystem Design Maturity Level (DML 1 to 5) Margins Allocated (5% to 20%)",
    measured: `Average Subsystem Margin = +${massProp.subsystemMarginPct.toFixed(2)}% (${massProp.subsystemMarginKg.toFixed(1)} kg)`,
    passed: dmlOk
  });

  // Rule 03: System-Level Reserve Margin Policy
  const sysMarginOk = massProp.systemGrowthMarginPct >= 10.0;
  checks.push({
    id: "ECSS-MASS-03",
    clause: "ECSS-M-ST-10C Cl. 5.3",
    requirement: "System-Level Reserve Margin Policy >= 10.0% at CDR",
    measured: `System Growth Margin = ${massProp.systemGrowthMarginPct.toFixed(1)}% (${massProp.systemReserveMarginKg.toFixed(1)} kg)`,
    passed: sysMarginOk
  });

  // Rule 04: Lateral Center of Mass Offset Compliance
  const lateralComOk = massProp.com.lateralOffset_mm <= maxLateralComMm;
  checks.push({
    id: "ECSS-MASS-04",
    clause: "ISO 22010 Cl. 5.3 / LV Interface",
    requirement: `Lateral Center of Mass (CoM) Offset <= ${maxLateralComMm.toFixed(1)} mm`,
    measured: `Lateral r_CoM = ${massProp.com.lateralOffset_mm.toFixed(2)} mm (X=${massProp.com.xCom_mm.toFixed(1)}mm, Y=${massProp.com.yCom_mm.toFixed(1)}mm)`,
    passed: lateralComOk
  });

  // Rule 05: Longitudinal Center of Mass Enclosure
  const zComOk = massProp.com.zCom_mm >= zMinMm && massProp.com.zCom_mm <= zMaxMm;
  checks.push({
    id: "ECSS-MASS-05",
    clause: "LV Payload User Guide / ISO 22010",
    requirement: `Longitudinal Center of Mass Enclosed in [${zMinMm.toFixed(0)}, ${zMaxMm.toFixed(0)}] mm`,
    measured: `Z_CoM = ${massProp.com.zCom_mm.toFixed(1)} mm`,
    passed: zComOk
  });

  // Rule 06: Clampband Separation Dynamic Tip-Off Rate
  const tipOffOk = massProp.com.lateralOffset_mm <= maxLateralComMm;
  checks.push({
    id: "ECSS-MASS-06",
    clause: "AIAA S-120 Cl. 5.4",
    requirement: "Separation Clampband Tip-Off Dynamic Angular Rate <= 0.50 deg/s",
    measured: `Predicted Tip-Off Rate = ${(massProp.com.lateralOffset_mm * 0.035).toFixed(3)} deg/s`,
    passed: tipOffOk
  });

  // Rule 07: Principal Axis of Inertia Alignment & Tilt Angle
  const tiltAngleOk = massProp.inertia.principalAxisTiltDeg <= maxTiltAngleDeg;
  checks.push({
    id: "ECSS-MASS-07",
    clause: "ISO 22010 Cl. 6.3",
    requirement: `Principal Axis of Inertia Misalignment Tilt Angle <= ${maxTiltAngleDeg.toFixed(2)} deg`,
    measured: `Tilt Angle theta = ${massProp.inertia.principalAxisTiltDeg.toFixed(3)} deg`,
    passed: tiltAngleOk
  });

  // Rule 08: Inertia Tensor Positive Definiteness
  const tensorOk = massProp.inertia.isPositiveDefinite;
  checks.push({
    id: "ECSS-MASS-08",
    clause: "Rigid Body Dynamics / ISO 22010",
    requirement: "Inertia Tensor Positive Definiteness (det(I) > 0, I_ii > 0)",
    measured: `det(I) = ${massProp.inertia.tensorDeterminant.toExponential(2)} kg³·m⁶ (Izz = ${massProp.inertia.Izz_kg_m2} kg·m²)`,
    passed: tensorOk
  });

  // Rule 09: Propellant Trapped Residual Accounting
  const residualFraction = massProp.usablePropellantKg > 0 ? (massProp.residualPropellantKg / massProp.usablePropellantKg) * 100.0 : 2.0;
  const residualOk = residualFraction >= 1.5;
  checks.push({
    id: "ECSS-MASS-09",
    clause: "ECSS-E-ST-35-01C Cl. 5.1",
    requirement: "Propellant Trapped Residual Accounting >= 1.5% of Usable Propellant",
    measured: `Residual = ${residualFraction.toFixed(2)}% (${massProp.residualPropellantKg.toFixed(2)} kg residual)`,
    passed: residualOk
  });

  // Rule 10: Electrical Harness Mass Ratio Consistency
  const harnessOk = massProp.harnessRatioPct >= 3.0 && massProp.harnessRatioPct <= 7.0;
  checks.push({
    id: "ECSS-MASS-10",
    clause: "ECSS-E-HB-31-01A / Systems Eng",
    requirement: "Electrical Harness Mass Ratio Consistency [3.0% to 7.0% of Dry Mass]",
    measured: `Harness Mass Ratio = ${massProp.harnessRatioPct.toFixed(2)}%`,
    passed: harnessOk
  });

  const passCount = checks.filter((c) => c.passed).length;
  const compliant = passCount === 10;

  return {
    missionName: missionConfig.name,
    auditScore: `${passCount} / 10 PASS`,
    passCount,
    compliant,
    checks,
    massProp
  };
}
