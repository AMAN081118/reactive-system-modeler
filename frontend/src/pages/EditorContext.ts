// src/pages/EditorContext.ts
import React, { useContext } from "react";
import { StateMachine, State, Transition, TestCase } from "../models/types";
import {
  SimulationPlaybackEngine,
  SimulationStep,
} from "../services/SimulationPlaybackEngine";
import { RightPanelTab } from "./EditorTypes";

// This interface defines everything our components might need
export interface IEditorContext {
  // State Machine
  stateMachine: StateMachine;
  setStateMachine: (sm: StateMachine) => void;
  selectedState: State | null;
  selectedTransition: Transition | null;
  selectedStateId: string;
  setSelectedStateId: (id: string) => void;
  selectedTransitionId: string | null;
  setSelectedTransitionId: (id: string | null) => void;

  // UI State
  isTransitionMode: boolean;
  setIsTransitionMode: (mode: boolean) => void;
  rightPanelWidth: number;
  setRightPanelWidth: (width: number) => void;
  rightPanelCollapsed: boolean;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  rightPanelTab: RightPanelTab;
  setRightPanelTab: (tab: RightPanelTab) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  examplesOpen: boolean;
  setExamplesOpen: (open: boolean) => void;
  descPanelOpen: boolean;
  setDescPanelOpen: (open: boolean) => void;
  // --- FIX 1: Changed type to allow null ---
  containerRef: React.RefObject<HTMLDivElement | null>;

  // Simulation State
  playbackEngine: SimulationPlaybackEngine;
  simulationResult: SimulationStep[] | null;
  inputSequence: string;
  setInputSequence: (seq: string) => void;
  isSimRunning: boolean;
  simCurrentStepIndex: number;
  simPlaybackState: {
    activeStateId: string | null;
    activeTransitionId: string | null;
  };
  simError: string | null;
  simBreakpoints: Set<string>;
  setSimBreakpoints: (bps: Set<string>) => void;
  generatedTestCases: TestCase[];
  setGeneratedTestCases: (cases: TestCase[]) => void;
  isSimulating: boolean;
  simExecutionHistory: any[]; // (Type this better if you can, e.g., ExecutionStep[])

  // Overlay Drag State
  overlayPos: { x: number; y: number };
  setOverlayPos: (pos: { x: number; y: number }) => void;
  isDraggingOverlay: boolean;
  setIsDraggingOverlay: (dragging: boolean) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;

  // Handlers
  handleAddState: (isInitial: boolean) => void;
  handleDeleteSelected: () => void;
  handleOverlayDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleStartSimulation: () => Promise<void>;
  handleSimPause: () => void;
  handleSimStep: () => void;
  handleSimReset: () => void;
  handleSimSpeedChange: (speed: number) => void;
  getPanelTitle: (tab: RightPanelTab) => string;
  handleTabClick: (tab: RightPanelTab) => void;

  // --- FIX 2: Added createNewMachine ---
  createNewMachine: () => StateMachine;
}

// Create the context
export const EditorContext = React.createContext<IEditorContext | null>(null);

// Create a helper hook to use the context easily
export const useEditor = (): IEditorContext => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};
