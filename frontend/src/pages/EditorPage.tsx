import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { StateMachine, State, TestCase } from "../models/types";
import { StorageService } from "../services/storageService";
import styles from "./EditorPage.module.css";
import {
  SimulationPlaybackEngine,
  PlaybackEvent,
  SimulationStep,
} from "../services/SimulationPlaybackEngine";
import { apiService } from "../services/apiService";
import ExamplesSidebar from "../components/Examples/ExamplesSidebar";

// Import the new Context and Types
import { RightPanelTab } from "./EditorTypes";
import { EditorContext, IEditorContext } from "./EditorContext";

// Import the new Layout Components
import EditorHeader from "./EditorHeader";
import LeftToolbar from "./LeftToolbar";
import CanvasArea from "./CanvasArea";
import RightPanel from "./RightPanel";

const EditorPage: React.FC = () => {
  // --- FIX: Wrap createNewMachine in useCallback ---
  const createNewMachine = useCallback(
    (): StateMachine => ({
      id: `sm-${Date.now()}`,
      name: "New State Machine",
      description: "",
      states: [],
      transitions: [],
      inputVariables: [],
      outputVariables: [],
      stateVariables: [],
      type: "mealy",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    [],
  );

  // --- ALL STATE REMAINS HERE ---
  const [stateMachine, setStateMachine] = useState<StateMachine>(
    () => StorageService.loadCurrentMachine() || createNewMachine(),
  );
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    string | null
  >(null);
  const [isTransitionMode, setIsTransitionMode] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(400);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] =
    useState<RightPanelTab>("properties");
  const [isResizing, setIsResizing] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [descPanelOpen, setDescPanelOpen] = useState(false);
  // --- FIX: Type allows null, which matches context ---
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- SIMULATION & TEST CASE STATE ---
  const [playbackEngine] = useState(() => new SimulationPlaybackEngine());
  const [simulationResult, setSimulationResult] = useState<
    SimulationStep[] | null
  >(null);
  const [inputSequence, setInputSequence] = useState<string>("");
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simCurrentStepIndex, setSimCurrentStepIndex] = useState(-1);
  const [simPlaybackState, setSimPlaybackState] = useState<{
    activeStateId: string | null;
    activeTransitionId: string | null;
  }>({
    activeStateId: null,
    activeTransitionId: null,
  });
  const [simError, setSimError] = useState<string | null>(null);
  const [simBreakpoints, setSimBreakpoints] = useState<Set<string>>(new Set());
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);

  // --- Draggable Input State ---
  const [overlayPos, setOverlayPos] = useState({
    x: window.innerWidth / 2 - 225,
    y: 20,
  });
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // --- ALL HANDLERS (Now wrapped in useCallback) ---

  const handleDeleteSelected = useCallback(() => {
    if (selectedStateId) {
      setStateMachine((sm) => ({
        ...sm,
        states: sm.states.filter((s) => s.id !== selectedStateId),
        transitions: sm.transitions.filter(
          (t) => t.from !== selectedStateId && t.to !== selectedStateId,
        ),
        updatedAt: new Date(),
      }));
      setSelectedStateId("");
    } else if (selectedTransitionId) {
      setStateMachine((sm) => ({
        ...sm,
        transitions: sm.transitions.filter(
          (t) => t.id !== selectedTransitionId,
        ),
        updatedAt: new Date(),
      }));
      setSelectedTransitionId(null);
    }
  }, [selectedStateId, selectedTransitionId]);

  // --- ALL EFFECTS (Many now depend on memoized handlers) ---
  useEffect(() => {
    const interval = setInterval(
      () => StorageService.saveMachine(stateMachine),
      30000,
    );
    return () => clearInterval(interval);
  }, [stateMachine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") handleDeleteSelected();
      if (e.key === "Escape") setIsTransitionMode(false);
      if (e.key === "Tab" && e.ctrlKey) {
        e.preventDefault();
        setRightPanelCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // --- FIX: Add handler to dependency array ---
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);

  useEffect(() => {
    const observer = {
      onPlaybackEvent: (event: PlaybackEvent) => {
        setSimPlaybackState({
          activeStateId: event.activeStateId,
          activeTransitionId: event.activeTransitionId,
        });
        setSimCurrentStepIndex(event.currentStepIndex);
        if (event.type === "PLAY") setIsSimRunning(true);
        if (
          event.type === "PAUSE" ||
          event.type === "END" ||
          event.type === "STOP"
        ) {
          setIsSimRunning(false);
        }
      },
    };
    playbackEngine.subscribe(observer);
    return () => playbackEngine.stop();
  }, [playbackEngine]);

  useEffect(() => {
    playbackEngine.stop();
    setSimulationResult(null);
    setSimError(null);
  }, [stateMachine, playbackEngine]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newW = rect.right - e.clientX;
      setRightPanelWidth(Math.max(320, Math.min(800, newW)));
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleOverlayDrag = (e: MouseEvent) => {
      if (!isDraggingOverlay) return;
      setOverlayPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleOverlayDragEnd = () => {
      setIsDraggingOverlay(false);
    };

    if (isDraggingOverlay) {
      window.addEventListener("mousemove", handleOverlayDrag);
      window.addEventListener("mouseup", handleOverlayDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleOverlayDrag);
      window.removeEventListener("mouseup", handleOverlayDragEnd);
    };
  }, [isDraggingOverlay, dragOffset]);

  // --- ALL HANDLERS (wrapped in useCallback) ---
  const handleAddState = useCallback(
    (isInitial: boolean) => {
      if (isInitial && stateMachine.states.some((s) => s.isInitial)) {
        alert("Only one initial state allowed.");
        return;
      }
      const newState: State = {
        id: `state-${Date.now()}`,
        name: `State ${stateMachine.states.length + 1}`,
        position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
        isInitial,
        isFinal: false,
      };
      setStateMachine((sm) => ({
        ...sm,
        states: [...sm.states, newState],
        updatedAt: new Date(),
      }));
    },
    [stateMachine.states],
  ); // Depends on stateMachine

  const handleOverlayDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDraggingOverlay(true);
      setDragOffset({
        x: e.clientX - overlayPos.x,
        y: e.clientY - overlayPos.y,
      });
    },
    [overlayPos],
  ); // Depends on overlayPos

  const getStepsFromApiResult = useCallback(
    (apiSteps: any[]): SimulationStep[] => {
      const stateNameMap = new Map<string, string>();
      stateMachine.states.forEach((s) => stateNameMap.set(s.name, s.id));

      return apiSteps.map((step, index) => {
        const fromStateId = stateNameMap.get(step.currentState);
        const toStateId = stateNameMap.get(step.nextState);
        const transition = stateMachine.transitions.find(
          (t) =>
            t.from === fromStateId &&
            t.to === toStateId &&
            (t.input === step.input || (!t.input && !step.input)),
        );
        return {
          step: index + 1,
          currentState: fromStateId || step.currentState,
          nextState: toStateId || step.nextState,
          input: step.input,
          output: step.output,
          transitionId: transition ? transition.id : `sim-trans-${index}`,
        };
      });
    },
    [stateMachine.states, stateMachine.transitions],
  ); // Depends on stateMachine

  const handleStartSimulation = useCallback(async () => {
    setSimError(null);
    setSimulationResult(null);
    playbackEngine.stop();
    const inputs = inputSequence.split(/\s+/).filter(Boolean);
    if (inputs.length === 0) {
      setSimError("Please enter an input sequence.");
      return;
    }
    try {
      const apiResult = await apiService.simulateMachine(stateMachine, inputs);
      if (!apiResult.isValid) {
        setSimError(
          "Simulation failed: " +
            (apiResult.steps.pop()?.output || "Invalid step"),
        );
        return;
      }
      const fullSteps = getStepsFromApiResult(apiResult.steps);
      if (
        fullSteps.some(
          (step) =>
            !step.currentState.startsWith("state-") ||
            !step.nextState.startsWith("state-"),
        )
      ) {
        setSimError(
          "Error: API result states do not match canvas state names.",
        );
        return;
      }
      setSimulationResult(fullSteps);
      const initialState = stateMachine.states.find((s) => s.isInitial);
      const firstStepInitialStateId = fullSteps[0].currentState;
      const initialStateId = initialState
        ? initialState.id
        : firstStepInitialStateId;
      playbackEngine.loadSimulation(fullSteps, initialStateId);
      playbackEngine.play();
    } catch (e) {
      console.error("Simulation API error:", e);
      setSimError(
        e instanceof Error ? e.message : "An unknown error occurred.",
      );
    }
  }, [inputSequence, playbackEngine, stateMachine, getStepsFromApiResult]);

  const handleSimPause = useCallback(
    () => playbackEngine.pause(),
    [playbackEngine],
  );

  const handleSimStep = useCallback(
    () => playbackEngine.stepForward(),
    [playbackEngine],
  );

  const handleSimReset = useCallback(() => {
    playbackEngine.stop();
    setSimulationResult(null);
    setSimError(null);
  }, [playbackEngine]);

  const handleSimSpeedChange = useCallback(
    (speed: number) => playbackEngine.setSpeed(speed),
    [playbackEngine],
  );

  const getPanelTitle = useCallback((tab: RightPanelTab): string => {
    switch (tab) {
      case "properties":
        return "Properties";
      case "transitions":
        return "Transitions List";
      case "simulator":
        return "Legacy Simulator";
      case "animate":
        return "Animation Playback";
      case "verification":
        return "Model Verification";
      case "testcases":
        return "Test Cases";
      case "export":
        return "Export";
      case "saveload":
        return "Save / Load";
      default:
        return "";
    }
  }, []); // No dependencies

  const handleTabClick = useCallback(
    (tab: RightPanelTab) => {
      if (rightPanelTab === "animate" && tab !== "animate") {
        handleSimReset();
      }
      setRightPanelTab(tab);
    },
    [rightPanelTab, handleSimReset],
  ); // Depends on rightPanelTab and handleSimReset

  // --- DERIVED STATE ---
  const selectedState = useMemo(
    () => stateMachine.states.find((s) => s.id === selectedStateId) || null,
    [stateMachine.states, selectedStateId],
  );

  const selectedTransition = useMemo(
    () =>
      stateMachine.transitions.find((t) => t.id === selectedTransitionId) ||
      null,
    [stateMachine.transitions, selectedTransitionId],
  );

  const isSimulating = useMemo(
    () => rightPanelTab === "animate",
    [rightPanelTab],
  );

  const simExecutionHistory = useMemo(() => {
    if (!simulationResult) return [];
    const stateIdMap = new Map<string, string>();
    stateMachine.states.forEach((s) => stateIdMap.set(s.id, s.name));
    return simulationResult.map((step) => ({
      ...step,
      currentState: stateIdMap.get(step.currentState) || step.currentState,
      nextState: stateIdMap.get(step.nextState) || step.nextState,
      duration: 0,
      timestamp: 0,
    }));
  }, [simulationResult, stateMachine.states]);

  // --- Create the Context Value ---
  const contextValue = useMemo(
    (): IEditorContext => ({
      // State
      stateMachine,
      selectedState,
      selectedTransition,
      selectedStateId,
      selectedTransitionId,
      isTransitionMode,
      rightPanelWidth,
      rightPanelCollapsed,
      rightPanelTab,
      isResizing,
      examplesOpen,
      descPanelOpen,
      containerRef,
      playbackEngine,
      simulationResult,
      inputSequence,
      isSimRunning,
      simCurrentStepIndex,
      simPlaybackState,
      simError,
      simBreakpoints,
      generatedTestCases,
      isSimulating,
      simExecutionHistory,
      overlayPos,
      isDraggingOverlay,
      dragOffset,
      // Setters
      setStateMachine,
      setSelectedStateId,
      setSelectedTransitionId,
      setIsTransitionMode,
      setRightPanelWidth,
      setRightPanelCollapsed,
      setRightPanelTab,
      setIsResizing,
      setExamplesOpen,
      setDescPanelOpen,
      setInputSequence,
      setSimBreakpoints,
      setGeneratedTestCases,
      setOverlayPos,
      setIsDraggingOverlay,
      setDragOffset,
      // --- FIX: Add all memoized handlers ---
      handleAddState,
      handleDeleteSelected,
      handleOverlayDragStart,
      handleStartSimulation,
      handleSimPause,
      handleSimStep,
      handleSimReset,
      handleSimSpeedChange,
      getPanelTitle,
      handleTabClick,
      createNewMachine,
    }),
    [
      // --- FIX: Add all handlers to the dependency array ---
      stateMachine,
      selectedState,
      selectedTransition,
      selectedStateId,
      selectedTransitionId,
      isTransitionMode,
      rightPanelWidth,
      rightPanelCollapsed,
      rightPanelTab,
      isResizing,
      examplesOpen,
      descPanelOpen,
      playbackEngine,
      simulationResult,
      inputSequence,
      isSimRunning,
      simCurrentStepIndex,
      simPlaybackState,
      simError,
      simBreakpoints,
      generatedTestCases,
      isSimulating,
      simExecutionHistory,
      overlayPos,
      isDraggingOverlay,
      dragOffset,
      handleAddState,
      handleDeleteSelected,
      handleOverlayDragStart,
      handleStartSimulation,
      handleSimPause,
      handleSimStep,
      handleSimReset,
      handleSimSpeedChange,
      getPanelTitle,
      handleTabClick,
      createNewMachine,
    ],
  );

  // --- THE RENDER IS UNCHANGED ---
  return (
    <EditorContext.Provider value={contextValue}>
      <div className={styles.pageContainer}>
        <EditorHeader />

        <div className={styles.mainContent}>
          <LeftToolbar />
          <CanvasArea />
          <RightPanel />
        </div>

        {/* Modals can stay here */}
        {examplesOpen && (
          <ExamplesSidebar
            isOpen={examplesOpen}
            onClose={() => setExamplesOpen(false)}
            onLoadExample={(m) => {
              setStateMachine({ ...m, id: `ex-${Date.now()}` });
              setExamplesOpen(false);
            }}
          />
        )}
      </div>
    </EditorContext.Provider>
  );
};

export default EditorPage;
