# ECSS-E-ST-10-02C & ISO 22010:2020 Specification

## Space Engineering — Spacecraft Mass Properties Control, DML Margins & Inertia Standard

### 1\. Scope & Normative Framework

This specification establishes the mathematical formulations, margin allocation methodologies, Center of Mass (CoM) synthesis, and moments of inertia tensor transformations implemented in **MassSpaceForge Pro (v1.0.0)**. The software enforces strict compliance with:

* **ECSS-E-ST-10-02C**: *Space engineering — Verification* (ESA/ESTEC, 1 February 2018\)  
* **ECSS-M-ST-10C Rev. 1**: *Space project management — Risk management / Mass margin policy*  
* **ISO 22010:2020**: *Space systems — Mass properties control*  
* **AIAA S-120**: *Mass Properties Control for Space Systems*

---

### 2\. Design Maturity Level (DML) Margin Methodology

Subsystem mass growth margins are categorized by hardware maturity level per ECSS-E-ST-10-02C Table 4-1:

| Maturity Category | Description | Minimum Maturity Margin |
| :---- | :---- | :---- |
| **DML 1** | Conceptual / Parametric rule-of-thumb estimates | \$+20.0%\$ (\$0.20\$) |
| **DML 2** | Preliminary design / PDR baseline drawings | \$+15.0%\$ (\$0.15\$) |
| **DML 3** | Detailed design / CDR models and vendor quotes | \$+10.0%\$ (\$0.10\$) |
| **DML 4** | Manufactured hardware / Qualification test articles | \$+5.0%\$ (\$0.05\$) |
| **DML 5** | Measured hardware / Off-the-shelf flight units | \$+2.0%\$ (\$0.02\$) |

#### 2.1 Subsystem Predicted Mass Roll-Up

For each subsystem \$i\$: \$\$M\_{\\text{pred}, i} \= M\_{\\text{nom}, i} \\cdot \\left(1 \+ \\text{DML}*i\\right)\$\$ \$\$M*{\\text{dry,pred}} \= \\sum\_{i=1}^{N} M\_{\\text{pred}, i}\$\$

#### 2.2 System-Level Growth Reserve Margin

In addition to subsystem-level maturity margins, a system-level reserve margin \$K\_{\\text{sys}}\$ is applied at the vehicle level: \$\$M\_{\\text{dry,design}} \= M\_{\\text{dry,pred}} \\cdot \\left(1 \+ K\_{\\text{sys}}\\right)\$\$ Where \$K\_{\\text{sys}} \\ge 0.10\$ (\$+10.0%\$) at CDR and \$\\ge 0.20\$ (\$+20.0%\$) at preliminary phases.

#### 2.3 Maximum Predicted Wet Mass (\$M\_{\\text{MPM}}\$)

\$\$M\_{\\text{wet,MPM}} \= M\_{\\text{dry,design}} \+ M\_{\\text{prop,usable}} \+ M\_{\\text{prop,residual}} \+ M\_{\\text{pressurant}}\$\$ Where residual propellant \$M\_{\\text{prop,residual}} \\ge 0.015 \\cdot M\_{\\text{prop,usable}}\$ (\$\\ge 1.5%\$).

#### 2.4 Launch Vehicle Lift Capability Margin

\$\$\\text{Margin}*{\\text{LV}} \= \\frac{M*{\\text{LV,capability}} \- M\_{\\text{wet,MPM}}}{M\_{\\text{LV,capability}}} \\cdot 100% \\ge \+10.0%\$\$

---

### 3\. Center of Mass (CoM) Synthesis

Coordinates are evaluated relative to the Launcher Separation Plane Interface origin: \$\$X\_{\\text{CoM}} \= \\frac{\\sum m\_i X\_i}{\\sum m\_i}, \\quad Y\_{\\text{CoM}} \= \\frac{\\sum m\_i Y\_i}{\\sum m\_i}, \\quad Z\_{\\text{CoM}} \= \\frac{\\sum m\_i Z\_i}{\\sum m\_i}\$\$

#### 3.1 Lateral Center of Mass Offset

\$\$r\_{\\text{lat}} \= \\sqrt{X\_{\\text{CoM}}^2 \+ Y\_{\\text{CoM}}^2} \\le r\_{\\text{clampband,limit}}\$\$ Typical limits:

* SmallSat / ESPA Rings: \$r\_{\\text{lat}} \\le 10.0\\text{ mm}\$  
* Heavy LEO / Medium Launchers: \$r\_{\\text{lat}} \\le 15.0\\text{ mm}\$  
* Large GEO Buses: \$r\_{\\text{lat}} \\le 25.0\\text{ mm}\$

---

### 4\. 3D Moments & Products of Inertia Tensor Solver

#### 4.1 Parallel Axis Theorem (Steiner's Theorem)

Translating component local inertias to the composite vehicle Center of Mass: \$\$\\Delta X\_i \= X\_i \- X\_{\\text{CoM}}, \\quad \\Delta Y\_i \= Y\_i \- Y\_{\\text{CoM}}, \\quad \\Delta Z\_i \= Z\_i \- Z\_{\\text{CoM}}\$\$ \$\$I\_{xx} \= \\sum\_{i=1}^N \\left\[ I\_{xx, i} \+ m\_i \\left(\\Delta Y\_i^2 \+ \\Delta Z\_i^2\\right) \\right\]\$\$ \$\$I\_{yy} \= \\sum\_{i=1}^N \\left\[ I\_{yy, i} \+ m\_i \\left(\\Delta X\_i^2 \+ \\Delta Z\_i^2\\right) \\right\]\$\$ \$\$I\_{zz} \= \\sum\_{i=1}^N \\left\[ I\_{zz, i} \+ m\_i \\left(\\Delta X\_i^2 \+ \\Delta Y\_i^2\\right) \\right\]\$\$ \$\$I\_{xy} \= \\sum\_{i=1}^N m\_i \\Delta X\_i \\Delta Y\_i, \\quad I\_{xz} \= \\sum\_{i=1}^N m\_i \\Delta X\_i \\Delta Z\_i, \\quad I\_{yz} \= \\sum\_{i=1}^N m\_i \\Delta Y\_i \\Delta Z\_i\$\$

#### 4.2 Principal Axis Misalignment & Tilt Angle

\$\$\\theta\_{\\text{tilt}} \= \\frac{1}{2} \\arctan\\left(\\frac{2 \\sqrt{I\_{xz}^2 \+ I\_{yz}^2}}{\\left\|I\_{zz} \- \\frac{I\_{xx} \+ I\_{yy}}{2}\\right\|}\\right) \\le 0.50^\\circ\$\$ The principal axis tilt angle shall not exceed \$0.50^\\circ\$ to prevent separation tip-off angular rates from exceeding \$0.50^\\circ/\\text{s}\$.