import React, { useState, useEffect, useRef } from "react";
import Canvas from "../components/Canvas/Canvas";
import PropertyPanel from "../components/PropertyPanel/PropertyPanel";
import Simulator from "../components/Simulator/SimulatorEngine";
import SaveLoadPanel from "../components/SaveLoad/SaveLoadPanel";
import TransitionList from "../components/TransitionList/TransitionList";
import VerificationPanel from "../components/Verification/VerificationPanel";
import ExamplesSidebar from "../components/Examples/ExamplesSidebar";
import DescriptionPanel from "../components/Canvas/DescriptionPanel";
import TestCasesPanel from "../components/TestCases/TestCasesPanel";
import ExportPanel from "../components/Exports/ExportPanel";
import { StateMachine, State } from "../models/types";
import { StorageService } from "../services/storageService";
import styles from "./EditorPage.module.css";
import {
  MousePointer2,
  PlusCircle,
  ArrowRightLeft,
  Trash2,
  BookOpen,
  Settings,
  PlayCircle,
  CheckCircle2,
  Download,
  Save,
  PanelRightClose,
  PanelRightOpen,
  Activity,
  ListTree,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

type RightPanelTab =
  | "properties"
  | "transitions"
  | "simulator"
  | "verification"
  | "testcases"
  | "export"
  | "saveload";

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

  // --- State ---
  const [stateMachine, setStateMachine] = useState<StateMachine>(() => {
    return StorageService.loadCurrentMachine() || createNewMachine();
  });
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedTransitionId, setSelectedTransitionId] = useState<
    string | null
  >(null);
  const [isTransitionMode, setIsTransitionMode] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(400);
  const [rightPanelCollapsed, setRightPanelCollapsed] =
    useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] =
    useState<RightPanelTab>("properties");
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [examplesOpen, setExamplesOpen] = useState<boolean>(false);
  // Changed default to false so it's hidden initially
  const [descPanelOpen, setDescPanelOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save & Keyboard Shortcuts
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStateId, selectedTransitionId]);

  // --- Handlers ---
  const handleAddState = (isInitial: boolean) => {
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
    setStateMachine({
      ...stateMachine,
      states: [...stateMachine.states, newState],
      updatedAt: new Date(),
    });
  };

  const handleDeleteSelected = () => {
    if (selectedStateId) {
      setStateMachine({
        ...stateMachine,
        states: stateMachine.states.filter((s) => s.id !== selectedStateId),
        transitions: stateMachine.transitions.filter(
          (t) => t.from !== selectedStateId && t.to !== selectedStateId,
        ),
        updatedAt: new Date(),
      });
      setSelectedStateId("");
    } else if (selectedTransitionId) {
      setStateMachine({
        ...stateMachine,
        transitions: stateMachine.transitions.filter(
          (t) => t.id !== selectedTransitionId,
        ),
        updatedAt: new Date(),
      });
      setSelectedTransitionId(null);
    }
  };

  // --- Resizing Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const newW =
        containerRef.current.getBoundingClientRect().right - e.clientX;
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

  // --- Derived State ---
  const selectedState =
    stateMachine.states.find((s) => s.id === selectedStateId) || null;
  const selectedTransition =
    stateMachine.transitions.find((t) => t.id === selectedTransitionId) || null;

  const getPanelTitle = (tab: RightPanelTab) => {
    switch (tab) {
      case "properties":
        return "Properties";
      case "transitions":
        return "Transitions List";
      case "simulator":
        return "Simulator";
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
  };

  return (
    <div className={styles.pageContainer}>
      {/* === HEADER === */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <Activity size={26} strokeWidth={2.5} />
          <h1 className={styles.appTitle}>Reactive System Modeler</h1>
        </div>
        <div className={styles.headerStats}>
          <span>{stateMachine.states.length} States</span>
          <span className={styles.separator}></span>
          <span>{stateMachine.transitions.length} Transitions</span>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <div className={styles.mainContent} ref={containerRef}>
        {/* LEFT TOOLBAR - Now with Text */}
        <div className={styles.leftToolbar}>
          <div className={styles.toolbarSectionTitle}>Tools</div>
          <ToolbarButton
            icon={<MousePointer2 size={18} />}
            label="Select"
            active={!isTransitionMode}
            onClick={() => setIsTransitionMode(false)}
          />
          <ToolbarButton
            icon={<ArrowRightLeft size={18} />}
            label="Connect"
            active={isTransitionMode}
            onClick={() => setIsTransitionMode(true)}
          />

          <div className={styles.toolbarSectionTitle}>Nodes</div>
          <ToolbarButton
            icon={<PlusCircle size={18} />}
            label="State"
            onClick={() => handleAddState(false)}
          />
          <ToolbarButton
            icon={
              <div
                style={{
                  fontWeight: "900",
                  fontSize: "14px",
                  width: 18,
                  textAlign: "center",
                }}
              >
                S
              </div>
            }
            label="Initial State"
            onClick={() => handleAddState(true)}
          />

          <div className={styles.toolbarSectionTitle}>Actions</div>
          <ToolbarButton
            icon={<Trash2 size={18} />}
            label="Delete"
            disabled={!selectedStateId && !selectedTransitionId}
            onClick={handleDeleteSelected}
            danger
          />

          <div className={styles.spacer} />
          <div className={styles.toolbarDivider} />

          {/* New Info Button */}
          <ToolbarButton
            icon={<Info size={18} />}
            label="Info"
            active={descPanelOpen}
            onClick={() => setDescPanelOpen(!descPanelOpen)}
          />
          <ToolbarButton
            icon={<BookOpen size={18} />}
            label="Examples"
            onClick={() => setExamplesOpen(true)}
          />
        </div>

        {/* CENTER CANVAS AREA */}
        <div className={styles.canvasArea}>
          <Canvas
            stateMachine={stateMachine}
            onStateMachineChange={(sm) =>
              setStateMachine({ ...sm, updatedAt: new Date() })
            }
            onSelectState={(id) => {
              setSelectedStateId(id);
              setRightPanelTab("properties");
              if (id) setRightPanelCollapsed(false);
            }}
            onSelectTransition={(id) => {
              setSelectedTransitionId(id);
              if (id) {
                setRightPanelTab("properties");
                setRightPanelCollapsed(false);
              }
            }}
            isTransitionMode={isTransitionMode}
            onTransitionModeChange={setIsTransitionMode}
          />
          {/* Conditionally render DescriptionPanel to avoid scrollbars when hidden */}
          {descPanelOpen && (
            <DescriptionPanel
              stateMachine={stateMachine}
              isOpen={descPanelOpen}
              onClose={() => setDescPanelOpen(false)}
            />
          )}
        </div>

        {/* RESIZER */}
        {!rightPanelCollapsed && (
          <div
            className={`${styles.resizer} ${
              isResizing ? styles.resizerActive : ""
            }`}
            onMouseDown={() => setIsResizing(true)}
          />
        )}

        {/* RIGHT PANEL - Sleeker */}
        <div
          className={`${styles.rightPanel} ${
            rightPanelCollapsed ? styles.rightPanelCollapsed : ""
          }`}
          style={{ width: rightPanelCollapsed ? 56 : rightPanelWidth }}
        >
          {rightPanelCollapsed ? (
            // COLLAPSED STATE: Just vertical icons
            <div className={styles.tabsVertical}>
              <button
                onClick={() => setRightPanelCollapsed(false)}
                className={styles.collapseButton}
                title="Expand Panel"
              >
                <ChevronLeft size={20} />
              </button>
              <div className={styles.toolbarDivider} style={{ width: "80%" }} />
              <TabButton
                icon={<Settings size={20} />}
                label="Properties"
                id="properties"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<ListTree size={20} />}
                label="Transitions"
                id="transitions"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<PlayCircle size={20} />}
                label="Simulate"
                id="simulator"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<FlaskConical size={20} />}
                label="Tests"
                id="testcases"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<CheckCircle2 size={20} />}
                label="Verify"
                id="verification"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<Download size={20} />}
                label="Export"
                id="export"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
              <TabButton
                icon={<Save size={20} />}
                label="Save/Load"
                id="saveload"
                current={rightPanelTab}
                collapsed={true}
                onClick={(id) => {
                  setRightPanelTab(id);
                  setRightPanelCollapsed(false);
                }}
              />
            </div>
          ) : (
            // EXPANDED STATE: Full header with tabs
            <>
              <div className={styles.panelHeader}>
                <div className={styles.panelControls}>
                  <h2 className={styles.panelTitle}>
                    {getPanelTitle(rightPanelTab)}
                  </h2>
                  <button
                    onClick={() => setRightPanelCollapsed(true)}
                    className={styles.collapseButton}
                    title="Collapse Panel"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div className={styles.tabsContainer}>
                  <TabButton
                    icon={<Settings size={16} />}
                    label="Properties"
                    id="properties"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<ListTree size={16} />}
                    label="Transitions"
                    id="transitions"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<PlayCircle size={16} />}
                    label="Simulate"
                    id="simulator"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<FlaskConical size={16} />}
                    label="Tests"
                    id="testcases"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<CheckCircle2 size={16} />}
                    label="Verify"
                    id="verification"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<Download size={16} />}
                    label="Export"
                    id="export"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                  <TabButton
                    icon={<Save size={16} />}
                    label="Save/Load"
                    id="saveload"
                    current={rightPanelTab}
                    collapsed={false}
                    onClick={setRightPanelTab}
                  />
                </div>
              </div>
              <div className={styles.panelContent}>
                {rightPanelTab === "properties" && (
                  <PropertyPanel
                    selectedState={selectedState}
                    selectedTransition={selectedTransition}
                    onStateUpdate={(s) =>
                      setStateMachine({
                        ...stateMachine,
                        states: stateMachine.states.map((st) =>
                          st.id === s.id ? s : st,
                        ),
                        updatedAt: new Date(),
                      })
                    }
                    onTransitionUpdate={(t) =>
                      setStateMachine({
                        ...stateMachine,
                        transitions: stateMachine.transitions.map((tr) =>
                          tr.id === t.id ? t : tr,
                        ),
                        updatedAt: new Date(),
                      })
                    }
                  />
                )}
                {rightPanelTab === "transitions" && (
                  <TransitionList
                    stateMachine={stateMachine}
                    selectedTransitionId={selectedTransitionId}
                    onSelectTransition={setSelectedTransitionId}
                    onDeleteTransition={(id) =>
                      setStateMachine({
                        ...stateMachine,
                        transitions: stateMachine.transitions.filter(
                          (t) => t.id !== id,
                        ),
                        updatedAt: new Date(),
                      })
                    }
                    onUpdateTransition={(t) =>
                      setStateMachine({
                        ...stateMachine,
                        transitions: stateMachine.transitions.map((tr) =>
                          tr.id === t.id ? t : tr,
                        ),
                        updatedAt: new Date(),
                      })
                    }
                  />
                )}
                {rightPanelTab === "simulator" && (
                  <Simulator stateMachine={stateMachine} />
                )}
                {rightPanelTab === "testcases" && (
                  <TestCasesPanel stateMachine={stateMachine} />
                )}
                {rightPanelTab === "verification" && (
                  <VerificationPanel stateMachine={stateMachine} />
                )}
                {rightPanelTab === "export" && (
                  <ExportPanel stateMachine={stateMachine} />
                )}
                {rightPanelTab === "saveload" && (
                  <SaveLoadPanel
                    currentMachine={stateMachine}
                    onLoadMachine={(m) => {
                      setStateMachine(m);
                      setSelectedStateId("");
                      setSelectedTransitionId(null);
                    }}
                    onNewMachine={() =>
                      window.confirm("Discard current work?") &&
                      setStateMachine(createNewMachine())
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExamplesSidebar
        isOpen={examplesOpen}
        onClose={() => setExamplesOpen(false)}
        onLoadExample={(m) => {
          setStateMachine({ ...m, id: `ex-${Date.now()}` });
          setExamplesOpen(false);
        }}
      />
    </div>
  );
};

// --- HELPER COMPONENTS ---

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, disabled, danger, onClick }) => {
  let className = styles.toolbarBtn;
  if (active) className += ` ${styles.toolbarBtnActive}`;
  if (disabled) className += ` ${styles.toolbarBtnDisabled}`;
  if (danger) className += ` ${styles.toolbarBtnDanger}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={className}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  id: RightPanelTab;
  current: RightPanelTab;
  collapsed: boolean;
  onClick: (id: RightPanelTab) => void;
}> = ({ icon, label, id, current, collapsed, onClick }) => {
  if (collapsed) {
    let className = styles.iconTabBtn;
    if (current === id) className += ` ${styles.iconTabBtnActive}`;
    return (
      <button onClick={() => onClick(id)} title={label} className={className}>
        {icon}
      </button>
    );
  }

  let className = styles.tabBtn;
  if (current === id) className += ` ${styles.tabBtnActive}`;

  return (
    <button onClick={() => onClick(id)} className={className}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default EditorPage;
