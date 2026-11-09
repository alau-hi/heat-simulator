# heat-simulator

## Claude analysis (2026-11-09)

This section was written by Claude (an AI assistant) after reading the repository. It has not been reviewed by a person.

**What it is:** an interactive React 19 + Vite 8 app that simulates how heat moves through a wood board held between two hot press platens, and how long the core takes to reach a target temperature. `package.json` names the project `press-heat-simulator`.

**How the model works** (`src/useHeatSimulation.js`)
- One-dimensional heat conduction through the board thickness, solved with an explicit finite-difference method on 20 nodes. Both faces are held at the platen temperature, optionally ramped over time.
- The board can be compressed during the run (start time, stop time, ratio). Thickness shrinks and thermal diffusivity rises with the compression ratio. The code's rule is a doubling of diffusivity for every 3x increase in density. That rule is an assumption in the code; no source is cited.
- Moisture adds an apparent specific-heat bump between 100 and 130 C to stand in for the energy of drying. The shape is a parabola chosen in the code.
- The run stops when the core node reaches the target temperature. Base diffusivity is noted in a comment as roughly 0.18e-6 m2/s, with a poplar calibration in the commit history.

**What the app offers:** a control panel, a temperature profile chart over time, a vertical heatmap, a time scrubber, an assumptions dialog, and a CSV export of simulation scenarios.

**Status:** 8 commits between 2026-04-08 and 2026-04-12, about 1,250 lines of source. Not verified against measurements.

**Relation to other repos:** `alau-hi/press-heat-simulator` is public but empty (created 2026-04-07, no files), so this repo holds the actual code. `press-energy-model` is a separate energy and CO2 model for the press.
