import React, { useState, useEffect, useRef } from "react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import PropertyPanel from "../components/PropertyPanel/PropertyPanel";
import Simulator from "../components/Simulator/SimulatorEngine";
import SaveLoadPanel from "../components/SaveLoad/SaveLoadPanel";
import TransitionList from "../components/TransitionList/TransitionList";
import { StateMachine, State, Transition } from "../models/types";
import { StorageService } from "../services/storageService";

const EditorPage: React.FC = () => {
  const createNewMachine = (): StateMachine => ({
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
  });

  const [stateMachine, setStateMachine] = useState<StateMachine>(() => {
    const saved = StorageService.loadCurrentMachine();
    return saved || createNewMachine();
  });

  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    string | null
  >(null);
  const [isTransitionMode, setIsTransitionMode] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(350);
  const [rightPanelCollapsed, setRightPanelCollapsed] =
    useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<
    "properties" | "transitions" | "simulator" | "saveload"
  >("properties");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      StorageService.saveMachine(stateMachine);
    }, 30000);

    return () => clearInterval(interval);
  }, [stateMachine]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.width - (e.clientX - containerRect.left);

      // Constrain width between 250px and 600px
      const constrainedWidth = Math.max(250, Math.min(600, newWidth));
      setRightPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  // Get selected objects
  const selectedState = selectedStateId
    ? stateMachine.states.find((s) => s.id === selectedStateId) || null
    : null;

  const selectedTransition = selectedTransitionId
    ? stateMachine.transitions.find((t) => t.id === selectedTransitionId) ||
      null
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        handleDeleteSelected();
      }
      if (e.key === "Escape") {
        setIsTransitionMode(false);
      }
      if (e.key === "Tab" && e.ctrlKey) {
        e.preventDefault();
        setRightPanelCollapsed(!rightPanelCollapsed);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStateId, selectedTransitionId, rightPanelCollapsed]);

  // Handlers
  const handleAddState = (stateName: string, isInitial: boolean): void => {
    if (isInitial && stateMachine.states.some((s) => s.isInitial)) {
      alert("Initial state already exists. Remove it first to add a new one.");
      return;
    }

    const newState: State = {
      id: `state-${Date.now()}`,
      name: stateName,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      isInitial,
      isFinal: false,
    };

    setStateMachine({
      ...stateMachine,
      states: [...stateMachine.states, newState],
      updatedAt: new Date(),
    });
  };

  const handleDeleteSelected = (): void => {
    if (selectedStateId) {
      const updatedStates = stateMachine.states.filter(
        (s) => s.id !== selectedStateId,
      );
      const updatedTransitions = stateMachine.transitions.filter(
        (t) => t.from !== selectedStateId && t.to !== selectedStateId,
      );

      setStateMachine({
        ...stateMachine,
        states: updatedStates,
        transitions: updatedTransitions,
        updatedAt: new Date(),
      });

      setSelectedStateId("");
    } else if (selectedTransitionId) {
      const updatedTransitions = stateMachine.transitions.filter(
        (t) => t.id !== selectedTransitionId,
      );

      setStateMachine({
        ...stateMachine,
        transitions: updatedTransitions,
        updatedAt: new Date(),
      });

      setSelectedTransitionId(null);
    }
  };

  const handleStateMachineChange = (updatedSM: StateMachine): void => {
    setStateMachine({
      ...updatedSM,
      updatedAt: new Date(),
    });
  };

  const handleSelectState = (stateId: string): void => {
    setSelectedStateId(stateId);
    setRightPanelTab("properties");
    if (rightPanelCollapsed) setRightPanelCollapsed(false);
  };

  const handleSelectTransition = (transitionId: string | null): void => {
    setSelectedTransitionId(transitionId);
    if (transitionId) {
      setRightPanelTab("properties");
      if (rightPanelCollapsed) setRightPanelCollapsed(false);
    }
  };

  const handleStateUpdate = (updatedState: State): void => {
    setStateMachine({
      ...stateMachine,
      states: stateMachine.states.map((s) =>
        s.id === updatedState.id ? updatedState : s,
      ),
      updatedAt: new Date(),
    });
  };

  const handleTransitionUpdate = (updatedTransition: Transition): void => {
    setStateMachine({
      ...stateMachine,
      transitions: stateMachine.transitions.map((t) =>
        t.id === updatedTransition.id ? updatedTransition : t,
      ),
      updatedAt: new Date(),
    });
  };

  const handleDeleteTransition = (transitionId: string): void => {
    const updatedTransitions = stateMachine.transitions.filter(
      (t) => t.id !== transitionId,
    );

    setStateMachine({
      ...stateMachine,
      transitions: updatedTransitions,
      updatedAt: new Date(),
    });

    setSelectedTransitionId(null);
  };

  const handleLoadMachine = (machine: StateMachine): void => {
    setStateMachine(machine);
    setSelectedStateId("");
    setSelectedTransitionId(null);
    setIsTransitionMode(false);
  };

  const handleNewMachine = (): void => {
    if (
      window.confirm(
        "Create a new machine? Current unsaved changes will be lost.",
      )
    ) {
      handleLoadMachine(createNewMachine());
    }
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  };

  const mainAreaStyle: React.CSSProperties = {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  };

  const canvasContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "300px",
    overflow: "hidden",
  };

  const dividerStyle: React.CSSProperties = {
    width: "6px",
    backgroundColor: "#ddd",
    cursor: "col-resize",
    transition: isResizing ? "none" : "background-color 0.2s",
    // ':hover': {
    //   backgroundColor: '#1976d2',
    // },
  };

  const rightPanelStyle: React.CSSProperties = {
    width: rightPanelCollapsed ? "40px" : `${rightPanelWidth}px`,
    backgroundColor: "#f9f9f9",
    borderLeft: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: rightPanelCollapsed ? "width 0.3s ease" : "none",
    minWidth: "40px",
    maxWidth: "600px",
  };

  const tabsStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: rightPanelCollapsed ? "column" : "row",
    borderBottom: rightPanelCollapsed ? "none" : "1px solid #ddd",
    backgroundColor: "#f0f0f0",
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: rightPanelCollapsed ? 0 : 1,
    padding: rightPanelCollapsed ? "8px" : "10px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: isActive ? "white" : "#f0f0f0",
    borderBottom:
      !rightPanelCollapsed && isActive ? "3px solid #1976d2" : "none",
    borderRight: rightPanelCollapsed && isActive ? "3px solid #1976d2" : "none",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: rightPanelCollapsed ? "0.6em" : "0.75em",
    whiteSpace: rightPanelCollapsed ? "pre-wrap" : "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: rightPanelCollapsed ? "35px" : "auto",
  });

  const scrollableAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: rightPanelCollapsed ? "0" : "10px",
  };

  const collapseButtonStyle: React.CSSProperties = {
    position: "absolute",
    right: rightPanelCollapsed ? "8px" : "8px",
    top: "70px",
    zIndex: 1000,
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "0.8em",
  };

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <Toolbar
        onAddState={handleAddState}
        onDeleteSelected={handleDeleteSelected}
        onToggleTransitionMode={setIsTransitionMode}
        isTransitionMode={isTransitionMode}
        stateMachineCount={stateMachine.states.length}
      />

      {/* Main Editor Area */}
      <div style={mainAreaStyle} ref={containerRef}>
        {/* Canvas */}
        <div style={canvasContainerStyle}>
          <Canvas
            stateMachine={stateMachine}
            onStateMachineChange={handleStateMachineChange}
            onSelectState={handleSelectState}
            onSelectTransition={handleSelectTransition}
            isTransitionMode={isTransitionMode}
            onTransitionModeChange={setIsTransitionMode}
          />
        </div>

        {/* Resizable Divider */}
        <div
          style={dividerStyle}
          onMouseDown={() => setIsResizing(true)}
          onMouseEnter={(e) => {
            if (!isResizing)
              (e.currentTarget as HTMLDivElement).style.backgroundColor =
                "#1976d2";
          }}
          onMouseLeave={(e) => {
            if (!isResizing)
              (e.currentTarget as HTMLDivElement).style.backgroundColor =
                "#ddd";
          }}
          title="Drag to resize (Min: 250px, Max: 600px)"
        />

        {/* Right Panel */}
        <div style={rightPanelStyle}>
          {/* Collapse Button */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            style={collapseButtonStyle}
            title="Toggle panel (Ctrl+Tab)"
          >
            {rightPanelCollapsed ? "◀" : "▶"}
          </button>

          {/* Tabs */}
          <div style={tabsStyle}>
            <div
              style={tabStyle(rightPanelTab === "properties")}
              onClick={() => setRightPanelTab("properties")}
              title="Properties"
            >
              {rightPanelCollapsed ? "📝" : "Properties"}
            </div>
            <div
              style={tabStyle(rightPanelTab === "transitions")}
              onClick={() => setRightPanelTab("transitions")}
              title="Transitions"
            >
              {rightPanelCollapsed ? "🔗" : "Transitions"}
            </div>
            <div
              style={tabStyle(rightPanelTab === "simulator")}
              onClick={() => setRightPanelTab("simulator")}
              title="Simulator"
            >
              {rightPanelCollapsed ? "▶️" : "Simulator"}
            </div>
            <div
              style={tabStyle(rightPanelTab === "saveload")}
              onClick={() => setRightPanelTab("saveload")}
              title="Save/Load"
            >
              {rightPanelCollapsed ? "💾" : "Save/Load"}
            </div>
          </div>

          {/* Tab Content */}
          {!rightPanelCollapsed && (
            <div style={scrollableAreaStyle}>
              {rightPanelTab === "properties" && (
                <PropertyPanel
                  selectedState={selectedState}
                  selectedTransition={selectedTransition}
                  onStateUpdate={handleStateUpdate}
                  onTransitionUpdate={handleTransitionUpdate}
                />
              )}

              {rightPanelTab === "transitions" && (
                <TransitionList
                  stateMachine={stateMachine}
                  selectedTransitionId={selectedTransitionId}
                  onSelectTransition={handleSelectTransition}
                  onDeleteTransition={handleDeleteTransition}
                  onUpdateTransition={handleTransitionUpdate}
                />
              )}

              {rightPanelTab === "simulator" && (
                <Simulator stateMachine={stateMachine} />
              )}

              {rightPanelTab === "saveload" && (
                <SaveLoadPanel
                  currentMachine={stateMachine}
                  onLoadMachine={handleLoadMachine}
                  onNewMachine={handleNewMachine}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: "10px 15px",
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #ddd",
          fontSize: "0.85em",
          color: "#666",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          States: {stateMachine.states.length} | Transitions:{" "}
          {stateMachine.transitions.length} | Selected:{" "}
          {selectedState?.name || "None"}
        </span>
        <span style={{ color: "#999", fontSize: "0.75em" }}>
          Drag divider to resize | Ctrl+Tab: Collapse panel | Delete: Remove
        </span>
      </div>
    </div>
  );
};

export default EditorPage;
