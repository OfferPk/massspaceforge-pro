# MassSpaceForge Pro (v1.0.0)

### Spacecraft Mass Properties Control, DML Margins, Center of Mass & Inertia Studio

**Standards**: ECSS-E-ST-10-02C \| ECSS-M-ST-10C Rev. 1 \| ISO 22010:2020 \| AIAA S-120

---

## Overview

**MassSpaceForge Pro** is an aerospace mass properties control and mechanical engineering software suite. It automates subsystem mass roll-ups, Design Maturity Level (DML 1 to 5\) growth margin allocation, system-level reserves, 3D Center of Mass (CoM) synthesis, and full 3D moments and products of inertia tensor transformations using the Parallel Axis Theorem (Steiner's theorem) in full compliance with European Space Agency (ESA) and ISO standards.

---

## Key Features

- **Design Maturity Level (DML) Margins**: Allocates normative mass growth margins based on hardware maturity: DML 1 (Conceptual \+20%), DML 2 (PDR \+15%), DML 3 (CDR \+10%), DML 4 (Qualified \+5%), and DML 5 (Measured/Off-the-shelf \+2%).  
- **System-Level Growth Reserve Policy**: Enforces contractual project management reserves (\$\\ge 10.0%\$ at CDR) and computes Maximum Predicted Wet Mass (\$M\_{\\text{MPM}}\$) against Launch Vehicle Lift Capability limits.  
- **3D Center of Mass (CoM) Solver**: Calculates exact \$X, Y, Z\$ coordinates and lateral offset \$r\_{\\text{lat}} \= \\sqrt{X^2 \+ Y^2}\$ relative to the launcher separation interface, verifying containment within clampband stay-in envelopes.  
- **3D Moments & Products of Inertia Tensor**: Translates subsystem local inertias to the vehicle CoM via the Parallel Axis Theorem, computing \$I\_{xx}, I\_{yy}, I\_{zz}, I\_{xy}, I\_{xz}, I\_{yz}\$, principal axis misalignment tilt angle (\$\\theta\_{\\text{tilt}} \\le 0.50^\\circ\$), and spin stability ratio (\$I\_z / I\_t\$).  
- **Launch Vehicle Lift Capability Margins**: Ensures launch vehicle payload capability margin exceeds \$+10.0%\$ to prevent insertion orbit shortfalls.  
- **Glass-Cockpit Web Studio**: Interactive browser-based workbench with offline cleanroom CSS utility fallbacks, dynamic vector SVG CoM position and mass bars, and XML manifest export.  
- **Python 3 CLI & Automated Test Suite**: Command-line interface and 10 unit test cases validating all normative mathematical models.

---

## Repository Structure

massspace-forge-pro/

├── source-code/

│   ├── massspace-engine.js             \# Pure ES6 physics & mass properties engine

│   ├── massspace-auditor.js            \# 10-point normative compliance auditor

│   ├── massspace\_cli.py                \# Python 3 CLI suite

│   ├── test\_runner.py                  \# 10 automated unit tests (100% pass)

│   ├── package.json                    \# ES module package descriptor

│   └── index.html                      \# Glass-Cockpit Web Studio

├── documentation/

│   ├── ECSS\_E\_ST\_10\_02C\_SPECIFICATION.md \# Mass properties engineering specification

│   ├── ECSS\_MASS\_COMPLIANCE\_MATRIX.md  \# 10-point normative verification matrix

│   ├── EXECUTIVE\_SUMMARY.md            \# Concise executive summary report

│   └── README.md                       \# This file

├── screenshots/

│   ├── massspace-architecture-diagram.svg

│   ├── massspace-studio-preview.svg

│   └── massspace-studio-screenshot.png

└── build/

    └── massspace-forge-pro-v1.0.0.zip  \# Standalone distribution package

---

## Quickstart Guide

### 1\. Run Web Studio Locally

Open `source-code/index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari). The application contains offline CSS fallbacks and executes 100% client-side with zero external network dependencies.

### 2\. Run Python CLI

\# Run analysis on Falcon 9 ESPA SmallSat preset

python3 source-code/massspace\_cli.py \--preset falcon9\_rideshare\_smallsat

\# Run analysis on LEO Mega-Constellation node

python3 source-code/massspace\_cli.py \--preset leo\_constellation\_node

\# Run analysis on GEO Telecom Flagship

python3 source-code/massspace\_cli.py \--preset geo\_telecom\_flagship

\# Output JSON telemetry

python3 source-code/massspace\_cli.py \--preset falcon9\_rideshare\_smallsat \--json

### 3\. Run Automated Unit Tests

python3 source-code/test\_runner.py

---

## Verification & Test Results

Ran 10 tests in 0.003s

OK (100% test pass rate)

- **Test 01**: Subsystem DML maturity margin factors (DML 1=20%, DML 5=2%) (PASS)  
- **Test 02**: System growth margin (+10% reserve) applied to predicted dry mass (PASS)  
- **Test 03**: Launch Vehicle lift capability margin \$\\ge \+10.0%\$ across all presets (PASS)  
- **Test 04**: 3D Center of Mass (CoM) coordinates synthesis (PASS)  
- **Test 05**: Lateral CoM offset compliance (\$r\_{\\text{lat}} \\le 10\\text{ mm}\$) (PASS)  
- **Test 06**: Parallel axis theorem (Steiner's theorem) inertia tensor translation (PASS)  
- **Test 07**: Principal axis tilt angle misalignment (\$\\theta\_{\\text{tilt}} \\le 0.50^\\circ\$) (PASS)  
- **Test 08**: Inertia tensor determinant \$\\det(\\mathbf{I}) \> 0\$ positive definiteness (PASS)  
- **Test 09**: Propellant trapped residual accounting \$\\ge 1.5%\$ (PASS)  
- **Test 10**: Negative margin sensitivity under excessive payload mass (PASS)

---

## Commercialization & Licensing

- **Developer Micro-SaaS**: \$149/month for commercial spacecraft mission operators and satellite primes.  
- **Flight Mission License**: \$1,499 one-time per spacecraft flight project, including full source code, Python CLI integration, and downloadable ECSS/ISO compliance certification reports.  
- **Hosting Overhead**: \$0.00/month (client-side execution via static GitHub Pages / Cloudflare Pages).