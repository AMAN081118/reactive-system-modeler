import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { StateMachine } from "./types/types";

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
app.use(bodyParser.json({ limit: "50mb" }));

// Type definitions
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { status: "healthy", uptime: process.uptime() },
    timestamp: Date.now(),
  } as ApiResponse<{ status: string; uptime: number }>);
});

/**
 * Validate state machine structure
 */
app.post("/api/validate", (req: Request, res: Response) => {
  try {
    const stateMachine: StateMachine = req.body;

    const errors: string[] = [];

    // Check initial state
    const initialStates = stateMachine.states.filter((s) => s.isInitial);
    if (initialStates.length === 0) {
      errors.push("No initial state defined");
    }
    if (initialStates.length > 1) {
      errors.push("Multiple initial states found");
    }

    // Check for transitions to non-existent states
    for (const transition of stateMachine.transitions) {
      const fromExists = stateMachine.states.some(
        (s) => s.id === transition.from,
      );
      const toExists = stateMachine.states.some((s) => s.id === transition.to);

      if (!fromExists) {
        errors.push(`Transition from non-existent state: ${transition.from}`);
      }
      if (!toExists) {
        errors.push(`Transition to non-existent state: ${transition.to}`);
      }
    }

    // Check for duplicate input on same state
    const stateTransitions = new Map<string, Set<string>>();
    for (const transition of stateMachine.transitions) {
      if (!stateTransitions.has(transition.from)) {
        stateTransitions.set(transition.from, new Set());
      }
      const inputs = stateTransitions.get(transition.from)!;
      if (transition.input && inputs.has(transition.input)) {
        errors.push(
          `Duplicate input "${transition.input}" on state ${
            stateMachine.states.find((s) => s.id === transition.from)?.name ||
            transition.from
          }`,
        );
      }
      if (transition.input) {
        inputs.add(transition.input);
      }
    }

    const valid = errors.length === 0;

    res.json({
      success: true,
      data: { valid, errors },
      timestamp: Date.now(),
    } as ApiResponse<{ valid: boolean; errors: string[] }>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Validation error: ${error}`,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
});

/**
 * Execute state machine simulation
 */
app.post("/api/simulate", (req: Request, res: Response) => {
  try {
    const { stateMachine, inputs } = req.body as {
      stateMachine: StateMachine;
      inputs: string[];
    };

    const initialState = stateMachine.states.find((s) => s.isInitial);
    if (!initialState) {
      return res.status(400).json({
        success: false,
        error: "No initial state defined",
        timestamp: Date.now(),
      });
    }

    const steps: any[] = [];
    let currentStateId = initialState.id;
    let isValid = true;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const currentState = stateMachine.states.find(
        (s) => s.id === currentStateId,
      );

      if (!currentState) {
        isValid = false;
        break;
      }

      // Find matching transition
      const transition = stateMachine.transitions.find(
        (t) => t.from === currentStateId && t.input === input,
      );

      if (!transition) {
        isValid = false;
        steps.push({
          step: i,
          input,
          currentState: currentState.name,
          nextState: currentState.name,
          output: "",
          transitionFound: false,
        });
        break;
      }

      const nextState = stateMachine.states.find((s) => s.id === transition.to);

      steps.push({
        step: i,
        input,
        currentState: currentState.name,
        nextState: nextState?.name || "Unknown",
        output: transition.output || "",
        transitionFound: true,
      });

      currentStateId = transition.to;
    }

    const finalState = stateMachine.states.find((s) => s.id === currentStateId);

    res.json({
      success: true,
      data: {
        isValid,
        initialState: initialState.name,
        finalState: finalState?.name || "Unknown",
        steps,
        totalSteps: steps.length,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Simulation error: ${error}`,
      timestamp: Date.now(),
    });
  }
});

/**
 * Generate test cases
 */
app.post("/api/generate-tests", (req: Request, res: Response) => {
  try {
    const stateMachine: StateMachine = req.body;

    const testCases: any[] = [];
    const initialState = stateMachine.states.find((s) => s.isInitial);

    if (!initialState) {
      return res.status(400).json({
        success: false,
        error: "No initial state",
        timestamp: Date.now(),
      });
    }

    // Generate path to each state
    const visited = new Set<string>();
    const queue: Array<{ stateId: string; path: string[] }> = [
      { stateId: initialState.id, path: [] },
    ];

    while (queue.length > 0) {
      const { stateId, path } = queue.shift()!;

      if (visited.has(stateId)) continue;
      visited.add(stateId);

      const state = stateMachine.states.find((s) => s.id === stateId);
      if (!state) continue;

      // Create test case for this state
      if (path.length > 0) {
        testCases.push({
          id: `test-${state.id}`,
          name: `Reach state: ${state.name}`,
          inputs: path,
          expectedFinalState: state.name,
        });
      }

      // Add outgoing transitions to queue
      const outgoing = stateMachine.transitions.filter(
        (t) => t.from === stateId,
      );
      for (const transition of outgoing) {
        queue.push({
          stateId: transition.to,
          path: [...path, transition.input || "unknown"],
        });
      }
    }

    res.json({
      success: true,
      data: { testCases, count: testCases.length },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Test generation error: ${error}`,
      timestamp: Date.now(),
    });
  }
});

app.post("/api/verify", (req: Request, res: Response) => {
  try {
    const stateMachine: StateMachine = req.body;

    const errors: string[] = [];
    const warnings: string[] = [];
    const deadlocks: string[] = [];
    const reachableStates = new Set<string>();
    const queue: string[] = [];
    const stateMap = new Map(stateMachine.states.map((s) => [s.id, s]));

    // Check initial state
    const initialStates = stateMachine.states.filter((s) => s.isInitial);
    if (initialStates.length === 0) {
      errors.push("No initial state defined");
    }
    if (initialStates.length > 1) {
      errors.push("Multiple initial states found");
    }

    // Check for transitions to non-existent states
    for (const transition of stateMachine.transitions) {
      const fromExists = stateMachine.states.some(
        (s) => s.id === transition.from,
      );
      const toExists = stateMachine.states.some((s) => s.id === transition.to);
      if (!fromExists) {
        errors.push(`Transition from non-existent state: ${transition.from}`);
      }
      if (!toExists) {
        errors.push(`Transition to non-existent state: ${transition.to}`);
      }
    }

    // Reachability analysis
    if (initialStates.length === 1) {
      queue.push(initialStates[0].id);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (!reachableStates.has(curr)) {
          reachableStates.add(curr);
          const outgoing = stateMachine.transitions.filter(
            (t) => t.from === curr,
          );
          for (const t of outgoing) queue.push(t.to);
        }
      }
      stateMachine.states.forEach((s) => {
        if (!reachableStates.has(s.id)) {
          warnings.push(`Unreachable state: ${s.name}`);
        }
      });
    }

    // Deadlock detection
    stateMachine.states.forEach((s) => {
      const outgoing = stateMachine.transitions.filter((t) => t.from === s.id);
      if (outgoing.length === 0 && !s.isFinal) {
        deadlocks.push(s.name);
        warnings.push(`Potential deadlock in state: ${s.name}`);
      }
    });

    // Report summary
    const summary = `States: ${stateMachine.states.length} (Reachable: ${
      reachableStates.size
    }) | Transitions: ${stateMachine.transitions.length} | Status: ${
      errors.length === 0 ? "VALID" : "INVALID"
    }`;

    res.json({
      success: true,
      data: {
        isValid: errors.length === 0,
        reachableStates: reachableStates.size,
        totalStates: stateMachine.states.length,
        errors,
        warnings,
        deadlocks,
        summary,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Verification error: ${error}`,
      timestamp: Date.now(),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
