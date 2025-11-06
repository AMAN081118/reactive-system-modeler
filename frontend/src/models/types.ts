/**
 * Core type definitions for Reactive System Modeler
 * All types are strictly typed - no 'any' allowed
 */

// Position interface for node placement
export interface Position {
  x: number;
  y: number;
}

// State definition
export interface State {
  id: string;
  name: string;
  position: Position;
  isInitial: boolean;
  isFinal: boolean;
  mode?: string;
  notes?: string;
}

// Transition definition
export interface Transition {
  id: string;
  from: string; // state id
  to: string; // state id
  input?: string;
  output?: string;
  guard?: string;
  action?: string;
}

// Variable definition
export interface Variable {
  name: string;
  type: "bool" | "int" | "nat" | "real" | "event";
  initialValue?: string | number | boolean;
  range?: {
    min: number;
    max: number;
  };
}

// Complete State Machine
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

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Canvas state for editor
export interface CanvasState {
  selectedStateId: string | null;
  selectedTransitionId: string | null;
  isDragging: boolean;
  zoom: number;
}

// Editor actions
export type EditorAction =
  | { type: "SELECT_STATE"; payload: string }
  | { type: "SELECT_TRANSITION"; payload: string }
  | { type: "DESELECT" }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "ADD_STATE"; payload: State }
  | { type: "REMOVE_STATE"; payload: string }
  | { type: "ADD_TRANSITION"; payload: Transition }
  | { type: "REMOVE_TRANSITION"; payload: string }
  | { type: "UPDATE_STATE"; payload: State }
  | { type: "UPDATE_TRANSITION"; payload: Transition };
