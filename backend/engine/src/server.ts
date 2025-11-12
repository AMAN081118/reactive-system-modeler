import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { StateMachine } from "../../src/types/types";

// Load native module (try-catch for development)
let verifier: any = null;
try {
  verifier = require("../build/Release/verifier");
  console.log("✓ C++ Verification engine loaded");
} catch (e) {
  console.warn(
    "⚠ C++ Verification engine not available (compile with: npm run build:native)",
  );
}

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
    data: {
      status: "healthy",
      uptime: process.uptime(),
      verifierAvailable: verifier !== null,
    },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

/**
 * Verify state machine with C++ engine
 */
app.post("/api/verify", (req: Request, res: Response) => {
  try {
    if (!verifier) {
      return res.status(503).json({
        success: false,
        error: "Verification engine not available",
        timestamp: Date.now(),
      });
    }

    const stateMachine: StateMachine = req.body;
    const result = verifier.verifyStateMachine(stateMachine);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Verification error: ${error}`,
      timestamp: Date.now(),
    });
  }
});

/**
 * Check if state is reachable
 */
app.post("/api/check-reachability", (req: Request, res: Response) => {
  try {
    if (!verifier) {
      return res.status(503).json({
        success: false,
        error: "Verification engine not available",
        timestamp: Date.now(),
      });
    }

    const { stateMachine, stateId } = req.body;
    const result = verifier.checkReachability(stateMachine, stateId);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Reachability check error: ${error}`,
      timestamp: Date.now(),
    });
  }
});

/**
 * Find deadlock states
 */
app.post("/api/find-deadlocks", (req: Request, res: Response) => {
  try {
    if (!verifier) {
      return res.status(503).json({
        success: false,
        error: "Verification engine not available",
        timestamp: Date.now(),
      });
    }

    const stateMachine: StateMachine = req.body;
    const deadlocks = verifier.findDeadlocks(stateMachine);

    res.json({
      success: true,
      data: { deadlocks },
      timestamp: Date.now(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Deadlock detection error: ${error}`,
      timestamp: Date.now(),
    });
  }
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
        errors.push(
          `Transition references non-existent state: ${transition.from}`,
        );
      }
      if (!toExists) {
        errors.push(
          `Transition references non-existent state: ${transition.to}`,
        );
      }
    }

    const valid = errors.length === 0;

    res.json({
      success: true,
      data: { valid, errors },
      timestamp: Date.now(),
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Validation error: ${error}`,
      timestamp: Date.now(),
    });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
