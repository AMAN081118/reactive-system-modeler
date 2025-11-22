# Reactive System Modeler

A modern graphical editor, simulator, and verifier for **Finite State Machines (FSMs)** — bringing together a powerful React frontend with a robust Node.js + C++ backend verification engine.

---

## Overview

**Reactive System Modeler** lets you visually design, simulate, and verify FSMs in your browser:

- Draw FSM state diagrams using an interactive drag-and-drop editor.
- Simulate how your FSM responds to input sequences.
- Verify properties (e.g., reachability, deadlocks) with a native C++ backend — no database required.
- Export models and reports in multiple formats.

---

## Features

- **Intuitive Canvas Drawing**
  - Add, delete, and move states and transitions via drag-and-drop.
  - Support for initial/final states, self-loops, and parallel edges.
  - Label transitions with input, guard, and output expressions.
- **Transition Modes**
  - One-click connect mode for easy transition drawing.
  - Handles for editing source/target/curve shape.
- **State/Transition Properties Panel**
  - Edit state names, properties, and types.
  - Edit transition details: input, guard, action, output, and more.
- **Simulation Panel**
  - Step-by-step FSM simulation with input sequences.
  - Visual trace of transitions and outputs per step.
  - Supports logical expressions and variables in guards/actions.
- **Formal Verification Panel**
  - Backend C++ engine for property checking.
  - Deadlock detection, unreachable states, coverage checks.
- **Test Case & Example Library**
  - Load/save FSMs as JSON.
  - Built-in examples to explore FSM design patterns.
- **Export/Report**
  - Export diagrams as PNG or PDF (with state/transition tables, verification results).
  - Export raw model data (JSON).
- **No Database Needed**
  - All computation is local + backend; nothing stored on a server.
- **Cross-platform & Free**
  - Deploys for free on Render (backend) + Vercel(frontend).

---

## Quickstart Guide

<small>For developers/contributors, see the section below.</small>

### 1. **Open the App**

- [https://reactive-system-modeler.vercel.app](#)

### 2. **Drawing Your FSM**

- **Add States:** Click the “State” button, then click anywhere on the canvas.
  - Drag to move; select to edit properties.
  - Set a state as _initial_ or _final_ in the side panel.
- **Add Transitions:**
  - Switch to “Connect” mode → click source state, then click target state.
  - Add self-loops by selecting the same state twice.
  - Edit label: input symbol, guards, or actions.
    - Example: `input=1 & x<10 / output=on; x=x+1`
- **Edit Diagram:**
  - Drag nodes, use handles to reshape transitions.
  - Select and edit any element’s properties in the side bar.
  - Delete states/transitions via toolbar or Delete key.
- _Canvas_
  ![alt text](/assets/image.png)
- _Features Tab_
  ![alt text](/assets/image-1.png)
- _Simulation Feature_
  ![alt text](/assets/image-2.png)
- _Animation_
  ![alt text](/assets/image-3.png)
- _Automated Test Generation_
  ![alt text](/assets/image-4.png)
- _Model Verification_
  ![alt text](/assets/image-5.png)
- _PDF Report Export_
  ![check out assest/Delay_Component_Report.pdf](/assets/image-6.png)

---

### 3. **Simulation**

- Go to the **Simulation** tab.
- Enter an input sequence:

```bash
input=1
input=0&x<10
input=1|x=10
```

- Click **Run Simulation**.
- View **trace table**: stepwise state transitions, outputs, and variable values.

---

### 4. **Verification & Analysis**

- Open the **Verification** tab.
- Click **Run Verification** to analyze your FSM with the backend engine.
- Checks performed:
- Unreachable and deadlock states
- Invariant properties (planned)
- Full verification summary

---

### 5. **Testing & Examples**

- Examples sidebar loads ready FSMs to study or modify.
- Test Cases tab : auto- or manually-created input/output scenarios.

---

### 6. **Saving, Loading & Exporting**

- Save/load FSMs as JSON (local, no database needed).
- Export diagrams to PNG or PDF, including state/transition tables and stepwise simulation reports.

---

## Key Concepts Supported

- Deterministic and nondeterministic FSMs (Moore/Mealy)
- Guarded transitions with boolean/logic/arithmetic expressions (`x<10`, `press=0 & tick>4`)
- Actions on transitions (`x=x+1`, `output=on`)
- Variable context (integer, boolean variables)
- Parallel and self-loop edges
- Arbitrary state/transition naming

---

## Advanced: Developer Usage

### Run Locally (Dev Mode)

- **Clone the repo\***

```bash
git clone https://github.com/AMAN081118/reactive-system-modeler.git
```

- Start backend in /backend (C++ verification engine needed for verification)

```bash
cd backend
npm install
npm run build
npm run build:native # optional, builds C++ modules
npm run dev # or: npm start for production
```

- Start frontend in /frontend

```bash
cd ../frontend
npm install
npm start
```

### Deployment

- **Backend**: Deploy `/backend` on Render.com (Docker, Node.js + C++ supported)
- **Frontend**: Deploy `/frontend` on Vercel

---

## Security & Privacy

- No user data is stored on any server or database by default.
- All FSM files are saved locally (browser or JSON export).
- Backend only processes data for verification during a session.

---

## Contributing & Support

- Issues and feature requests via GitHub Issues
- See TODO below for planned improvements

---

## TODO & Roadmap

- [ ] Liveness and reachability property support
- [ ] Temporal logic queries
- [ ] FSM minimization/normalization tools
- [ ] Input sequence auto-generation
- [ ] Animation improvements
- [ ] More built-in examples

---

## License

MIT License • (C) 2025 AMAN KUMAR  
C++ backend source from [Principles of Cyber-Physical Systems Book by Rajeev Alur] is credited accordingly.

---
