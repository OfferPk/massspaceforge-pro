/**
 * MassSpaceForge Pro v1.0.0 — Pure ES6 Spacecraft Mass Properties & Inertia Engine
 * Standards: ECSS-E-ST-10-02C & ECSS-M-ST-10C & ISO 22010:2020 & AIAA S-120
 */

export const MASS_CONSTANTS = {
  DML_MARGINS: {
    DML_1: { level: 1, label: "DML 1 (Conceptual / Parametric)", marginPct: 20.0, factor: 0.20 },
    DML_2: { level: 2, label: "DML 2 (Preliminary / PDR)", marginPct: 15.0, factor: 0.15 },
    DML_3: { level: 3, label: "DML 3 (Detailed / CDR)", marginPct: 10.0, factor: 0.10 },
    DML_4: { level: 4, label: "DML 4 (Manufactured / Qualified)", marginPct: 5.0, factor: 0.05 },
    DML_5: { level: 5, label: "DML 5 (Measured / Off-the-Shelf)", marginPct: 2.0, factor: 0.02 }
  },
  DEFAULT_SYSTEM_MARGIN_PCT: 10.0, // ECSS system growth margin at CDR
  DEFAULT_MAX_LATERAL_OFFSET_MM: 10.0, // Typical LV separation clampband limit
  DEFAULT_MAX_TILT_ANGLE_DEG: 0.50, // Max principal axis misalignment angle
  MIN_HARNESS_RATIO_PCT: 3.0,
  MAX_HARNESS_RATIO_PCT: 7.0
};

/**
 * Calculates subsystem masses applying Design Maturity Level (DML) margins
 * @param {Array<Object>} subsystems
 * @returns {Array<Object>}
 */
export function calculateSubsystemMasses(subsystems) {
  return subsystems.map((s, idx) => {
    const nomMass = Number(s.nominalMassKg || 0.0);
    const dmlKey = s.dmlKey || "DML_3";
    const dml = MASS_CONSTANTS.DML_MARGINS[dmlKey] || MASS_CONSTANTS.DML_MARGINS.DML_3;
    const maturityMarginKg = nomMass * dml.factor;
    const predictedMassKg = nomMass + maturityMarginKg;

    return {
      index: idx,
      id: s.id,
      name: s.name,
      subsystem: s.subsystem,
      nominalMassKg: Number(nomMass.toFixed(2)),
      dmlKey,
      dmlLevel: dml.level,
      dmlLabel: dml.label,
      dmlMarginPct: dml.marginPct,
      maturityMarginKg: Number(maturityMarginKg.toFixed(2)),
      predictedMassKg: Number(predictedMassKg.toFixed(2)),
      posX: Number(s.posX_mm || 0.0),
      posY: Number(s.posY_mm || 0.0),
      posZ: Number(s.posZ_mm || 0.0),
      ixx: Number(s.ixx_kg_m2 || 0.0),
      iyy: Number(s.iyy_kg_m2 || 0.0),
      izz: Number(s.izz_kg_m2 || 0.0)
    };
  });
}

/**
 * Solves 3D Center of Mass (CoM) coordinates relative to launcher interface
 * @param {Array<Object>} items
 * @returns {Object}
 */
export function solveCenterOfMass(items) {
  let totalMass = 0.0;
  let sumMx = 0.0;
  let sumMy = 0.0;
  let sumMz = 0.0;

  items.forEach((item) => {
    const m = Number(item.predictedMassKg || item.massKg || 0.0);
    totalMass += m;
    sumMx += m * Number(item.posX || item.posX_mm || 0.0);
    sumMy += m * Number(item.posY || item.posY_mm || 0.0);
    sumMz += m * Number(item.posZ || item.posZ_mm || 0.0);
  });

  const xCom = totalMass > 0 ? sumMx / totalMass : 0.0;
  const yCom = totalMass > 0 ? sumMy / totalMass : 0.0;
  const zCom = totalMass > 0 ? sumMz / totalMass : 0.0;
  const lateralOffset = Math.sqrt(Math.pow(xCom, 2) + Math.pow(yCom, 2));

  return {
    totalMassKg: Number(totalMass.toFixed(2)),
    xCom_mm: Number(xCom.toFixed(2)),
    yCom_mm: Number(yCom.toFixed(2)),
    zCom_mm: Number(zCom.toFixed(2)),
    lateralOffset_mm: Number(lateralOffset.toFixed(2))
  };
}

/**
 * Solves full 3x3 Moments & Products of Inertia tensor at the CoM via Parallel Axis Theorem
 * @param {Array<Object>} items
 * @param {Object} com
 * @returns {Object}
 */
export function solveInertiaTensor(items, com) {
  let Ixx = 0.0;
  let Iyy = 0.0;
  let Izz = 0.0;
  let Ixy = 0.0;
  let Ixz = 0.0;
  let Iyz = 0.0;

  const xComM = com.xCom_mm / 1000.0;
  const yComM = com.yCom_mm / 1000.0;
  const zComM = com.zCom_mm / 1000.0;

  items.forEach((item) => {
    const m = Number(item.predictedMassKg || item.massKg || 0.0);
    const xiM = Number(item.posX || item.posX_mm || 0.0) / 1000.0;
    const yiM = Number(item.posY || item.posY_mm || 0.0) / 1000.0;
    const ziM = Number(item.posZ || item.posZ_mm || 0.0) / 1000.0;

    const dx = xiM - xComM;
    const dy = yiM - yComM;
    const dz = ziM - zComM;

    const ixxLocal = Number(item.ixx || item.ixx_kg_m2 || 0.0);
    const iyyLocal = Number(item.iyy || item.iyy_kg_m2 || 0.0);
    const izzLocal = Number(item.izz || item.izz_kg_m2 || 0.0);

    // Parallel axis theorem: Ixx = Ixx_local + m * (dy^2 + dz^2)
    Ixx += ixxLocal + m * (Math.pow(dy, 2) + Math.pow(dz, 2));
    Iyy += iyyLocal + m * (Math.pow(dx, 2) + Math.pow(dz, 2));
    Izz += izzLocal + m * (Math.pow(dx, 2) + Math.pow(dy, 2));

    // Products of inertia (engineering convention): Ixy = sum(m * dx * dy)
    Ixy += m * dx * dy;
    Ixz += m * dx * dz;
    Iyz += m * dy * dz;
  });

  // Transverse inertia It = (Ixx + Iyy) / 2
  const transverseInertia = (Ixx + Iyy) / 2.0;
  const spinRatio = transverseInertia > 0 ? Izz / transverseInertia : 1.0;

  // Principal axis tilt angle estimation from cross-products
  const crossProdMagnitude = Math.sqrt(Math.pow(Ixz, 2) + Math.pow(Iyz, 2));
  const den = Math.abs(Izz - transverseInertia);
  let tiltAngleDeg = 0.0;
  if (den > 1e-6) {
    tiltAngleDeg = 0.5 * Math.atan((2.0 * crossProdMagnitude) / den) * (180.0 / Math.PI);
  }

  // Determinant check for positive definiteness
  const det = Ixx * (Iyy * Izz - Math.pow(Iyz, 2)) - Ixy * (Ixy * Izz - Ixz * Iyz) + Ixz * (Ixy * Iyz - Ixz * Iyy);

  return {
    Ixx_kg_m2: Number(Ixx.toFixed(3)),
    Iyy_kg_m2: Number(Iyy.toFixed(3)),
    Izz_kg_m2: Number(Izz.toFixed(3)),
    Ixy_kg_m2: Number(Ixy.toFixed(4)),
    Ixz_kg_m2: Number(Ixz.toFixed(4)),
    Iyz_kg_m2: Number(Iyz.toFixed(4)),
    transverseInertia_kg_m2: Number(transverseInertia.toFixed(3)),
    spinStabilityRatio: Number(spinRatio.toFixed(3)),
    principalAxisTiltDeg: Number(tiltAngleDeg.toFixed(3)),
    tensorDeterminant: Number(det.toFixed(2)),
    isPositiveDefinite: det > 0 && Ixx > 0 && (Ixx * Iyy - Math.pow(Ixy, 2)) > 0
  };
}

/**
 * Evaluates the full spacecraft mass budget and launch vehicle capability margins
 * @param {Object} missionConfig
 * @returns {Object}
 */
export function evaluateSpacecraftMassProperties(missionConfig) {
  const subsystems = calculateSubsystemMasses(missionConfig.subsystems || []);
  const dryNominalMassKg = subsystems.reduce((acc, s) => acc + s.nominalMassKg, 0.0);
  const dryPredictedMassKg = subsystems.reduce((acc, s) => acc + s.predictedMassKg, 0.0);
  const subsystemMarginKg = dryPredictedMassKg - dryNominalMassKg;
  const subsystemMarginPct = dryNominalMassKg > 0 ? (subsystemMarginKg / dryNominalMassKg) * 100.0 : 0.0;

  const sysMarginPct = Number(missionConfig.systemGrowthMarginPct || MASS_CONSTANTS.DEFAULT_SYSTEM_MARGIN_PCT);
  const systemReserveMarginKg = dryPredictedMassKg * (sysMarginPct / 100.0);
  const dryDesignMassKg = dryPredictedMassKg + systemReserveMarginKg;

  // Fluids (propellant, trapped residuals, pressurant)
  const propNominalKg = Number(missionConfig.usablePropellantMassKg || 0.0);
  const propResidualKg = Number(missionConfig.trappedResidualPropellantKg || (propNominalKg * 0.02));
  const pressurantKg = Number(missionConfig.pressurantGasMassKg || 0.0);
  const totalFluidMassKg = propNominalKg + propResidualKg + pressurantKg;

  // Maximum Predicted Wet Mass (MPM)
  const maximumPredictedWetMassKg = dryDesignMassKg + totalFluidMassKg;

  // Launch Vehicle Lift Capability & Margin
  const lvCapabilityKg = Number(missionConfig.launchVehicleCapabilityKg || 500.0);
  const lvMarginKg = lvCapabilityKg - maximumPredictedWetMassKg;
  const lvMarginPct = lvCapabilityKg > 0 ? (lvMarginKg / lvCapabilityKg) * 100.0 : 0.0;

  // CoM and Inertia calculations
  const allMassItems = [
    ...subsystems,
    {
      id: "FLUID-01",
      name: "Usable & Residual Propellant",
      subsystem: "Propulsion Wet",
      predictedMassKg: totalFluidMassKg,
      posX_mm: Number(missionConfig.tankPosX_mm || 0.0),
      posY_mm: Number(missionConfig.tankPosY_mm || 0.0),
      posZ_mm: Number(missionConfig.tankPosZ_mm || (subsystems.length > 0 ? subsystems[0].posZ : 450.0)),
      ixx_kg_m2: Number(missionConfig.tankIxx || 0.25),
      iyy_kg_m2: Number(missionConfig.tankIyy || 0.25),
      izz_kg_m2: Number(missionConfig.tankIzz || 0.35)
    }
  ];

  const com = solveCenterOfMass(allMassItems);
  const inertia = solveInertiaTensor(allMassItems, com);

  // Harness ratio check
  const harnessSub = subsystems.find((s) => s.subsystem.toLowerCase().includes("harness") || s.name.toLowerCase().includes("harness"));
  const harnessMassKg = harnessSub ? harnessSub.nominalMassKg : (dryNominalMassKg * 0.045);
  const harnessRatioPct = dryNominalMassKg > 0 ? (harnessMassKg / dryNominalMassKg) * 100.0 : 4.5;

  return {
    missionName: missionConfig.name,
    dryNominalMassKg: Number(dryNominalMassKg.toFixed(2)),
    dryPredictedMassKg: Number(dryPredictedMassKg.toFixed(2)),
    subsystemMarginKg: Number(subsystemMarginKg.toFixed(2)),
    subsystemMarginPct: Number(subsystemMarginPct.toFixed(2)),
    systemGrowthMarginPct: sysMarginPct,
    systemReserveMarginKg: Number(systemReserveMarginKg.toFixed(2)),
    dryDesignMassKg: Number(dryDesignMassKg.toFixed(2)),
    usablePropellantKg: Number(propNominalKg.toFixed(2)),
    residualPropellantKg: Number(propResidualKg.toFixed(2)),
    pressurantGasKg: Number(pressurantKg.toFixed(2)),
    totalFluidMassKg: Number(totalFluidMassKg.toFixed(2)),
    maximumPredictedWetMassKg: Number(maximumPredictedWetMassKg.toFixed(2)),
    launchVehicleCapabilityKg: Number(lvCapabilityKg.toFixed(2)),
    launchVehicleMarginKg: Number(lvMarginKg.toFixed(2)),
    launchVehicleMarginPct: Number(lvMarginPct.toFixed(2)),
    harnessRatioPct: Number(harnessRatioPct.toFixed(2)),
    subsystems,
    com,
    inertia
  };
}
