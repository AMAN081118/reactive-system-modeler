export interface Position {
  x: number;
  y: number;
}

export interface State {
  id: string;
  name: string;
  position: Position;
  isInitial: boolean;
  isFinal: boolean;
  mode?: string;
  notes?: string;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  input?: string;
  output?: string;
  guard?: string;
  action?: string;
}

export interface Variable {
  name: string;
  type: "bool" | "int" | "nat" | "real" | "event";
  initialValue?: string | number | boolean;
  range?: { min: number; max: number };
}

export interface StateMachine {
  id: string;
  name: string;
  description?: string;
  states: State[];
  transitions: Transition[];
  inputVariables: Variable[];
  outputVariables: Variable[];
  stateVariables: Variable[];
  type: "mealy" | "moore";
  createdAt: Date;
  updatedAt: Date;
}
