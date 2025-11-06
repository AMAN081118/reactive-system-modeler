import { StateMachine, State, Transition } from "../models/types";

export interface SimulationStep {
  step: number;
  input: string;
  currentState: string;
  nextState: string;
  output: string;
  guardEvaluated: boolean;
  guardPassed: boolean;
  actionExecuted: string;
}

export interface SimulationTrace {
  machineId: string;
  machineName: string;
  initialState: string;
  steps: SimulationStep[];
  isValid: boolean;
  finalState: string;
  totalSteps: number;
}

export class SimulatorService {
  /**
   * Find initial state
   */
  static getInitialState(machine: StateMachine): State | null {
    return machine.states.find((s) => s.isInitial) || null;
  }

  /**
   * Find transition from current state with given input
   */
  static findTransition(
    machine: StateMachine,
    fromStateId: string,
    input: string,
  ): Transition | null {
    return (
      machine.transitions.find(
        (t) => t.from === fromStateId && t.input === input,
      ) || null
    );
  }

  /**
   * Simple guard evaluation (basic boolean expressions)
   * Examples: "x > 5", "state == ready", etc.
   * For now, we'll do simple string matching
   */
  private static evaluateGuard(
    guard: string | undefined,
    _context: Record<string, any>,
  ): boolean {
    if (!guard || guard.trim() === "") {
      return true; // No guard = always pass
    }

    // TODO: Implement proper expression evaluator
    // For now, just return true if guard exists
    return true;
  }

  /**
   * Execute action (simple variable updates)
   * Examples: "x = x + 1", "counter = 0", etc.
   */
  private static executeAction(
    action: string | undefined,
    _context: Record<string, any>,
  ): string {
    if (!action || action.trim() === "") {
      return "";
    }

    // TODO: Implement proper action executor
    return action;
  }

  /**
   * Run a single simulation step
   */
  static step(
    machine: StateMachine,
    currentStateId: string,
    input: string,
    context: Record<string, any> = {},
  ): { nextStateId: string; output: string; success: boolean } {
    // Find transition
    const transition = this.findTransition(machine, currentStateId, input);

    if (!transition) {
      return {
        nextStateId: currentStateId,
        output: "",
        success: false,
      };
    }

    // Evaluate guard
    const guardPassed = this.evaluateGuard(transition.guard, context);

    if (!guardPassed) {
      return {
        nextStateId: currentStateId,
        output: "",
        success: false,
      };
    }

    // Execute action
    const actionResult = this.executeAction(transition.action, context);

    return {
      nextStateId: transition.to,
      output: transition.output || "",
      success: true,
    };
  }

  /**
   * Run complete simulation with input sequence
   */
  static simulate(
    machine: StateMachine,
    inputs: string[],
    context: Record<string, any> = {},
  ): SimulationTrace {
    const initialState = this.getInitialState(machine);

    if (!initialState) {
      return {
        machineId: machine.id,
        machineName: machine.name,
        initialState: "",
        steps: [],
        isValid: false,
        finalState: "",
        totalSteps: 0,
      };
    }

    const steps: SimulationStep[] = [];
    let currentStateId = initialState.id;
    let stepNumber = 0;
    let isValid = true;

    for (const input of inputs) {
      const currentState = machine.states.find((s) => s.id === currentStateId);
      if (!currentState) {
        isValid = false;
        break;
      }

      const transition = this.findTransition(machine, currentStateId, input);

      if (!transition) {
        isValid = false;
        steps.push({
          step: stepNumber,
          input,
          currentState: currentState.name,
          nextState: currentState.name,
          output: "",
          guardEvaluated: false,
          guardPassed: false,
          actionExecuted: "",
        });
        break;
      }

      const guardPassed = this.evaluateGuard(transition.guard, context);
      const actionResult = this.executeAction(transition.action, context);
      const nextState = machine.states.find((s) => s.id === transition.to);

      if (!nextState) {
        isValid = false;
        break;
      }

      steps.push({
        step: stepNumber,
        input,
        currentState: currentState.name,
        nextState: nextState.name,
        output: transition.output || "",
        guardEvaluated: !!transition.guard,
        guardPassed,
        actionExecuted: actionResult,
      });

      currentStateId = transition.to;
      stepNumber++;
    }

    const finalState = machine.states.find((s) => s.id === currentStateId);

    return {
      machineId: machine.id,
      machineName: machine.name,
      initialState: initialState.name,
      steps,
      isValid,
      finalState: finalState?.name || "",
      totalSteps: stepNumber,
    };
  }

  /**
   * Check if simulation reached a final state
   */
  static isFinalState(machine: StateMachine, stateId: string): boolean {
    const state = machine.states.find((s) => s.id === stateId);
    return state ? state.isFinal : false;
  }

  /**
   * Get all reachable states from initial state
   */
  static getReachableStates(machine: StateMachine): State[] {
    const initialState = this.getInitialState(machine);
    if (!initialState) return [];

    const reachable = new Set<string>();
    const queue = [initialState.id];

    while (queue.length > 0) {
      const stateId = queue.shift();
      if (!stateId || reachable.has(stateId)) continue;

      reachable.add(stateId);

      // Find all transitions from this state
      const outgoing = machine.transitions.filter((t) => t.from === stateId);
      for (const transition of outgoing) {
        if (!reachable.has(transition.to)) {
          queue.push(transition.to);
        }
      }
    }

    return Array.from(reachable)
      .map((id) => machine.states.find((s) => s.id === id))
      .filter((s) => s !== undefined) as State[];
  }

  /**
   * Validate state machine structure
   */
  static validate(machine: StateMachine): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check initial state
    const initialStates = machine.states.filter((s) => s.isInitial);
    if (initialStates.length === 0) {
      errors.push("No initial state defined");
    }
    if (initialStates.length > 1) {
      errors.push("Multiple initial states found");
    }

    // Check for transitions to non-existent states
    for (const transition of machine.transitions) {
      const fromExists = machine.states.some((s) => s.id === transition.from);
      const toExists = machine.states.some((s) => s.id === transition.to);

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

    // Check for unreachable states
    const reachable = this.getReachableStates(machine);
    const unreachable = machine.states.filter(
      (s) => !reachable.find((r) => r.id === s.id),
    );
    if (unreachable.length > 0) {
      errors.push(
        `Unreachable states: ${unreachable.map((s) => s.name).join(", ")}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
