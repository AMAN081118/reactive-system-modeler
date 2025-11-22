// src/pages/RightPanel.tsx
import React from "react";
import {
  Settings,
  ListTree,
  PlayCircle,
  Zap,
  FlaskConical,
  CheckCircle2,
  Download,
  Save,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { useEditor } from "./EditorContext";
import { TabButton } from "./LayoutHelpers";
import styles from "./EditorPage.module.css";

// Import all the panels it needs
import PropertyPanel from "../components/PropertyPanel/PropertyPanel";
import Simulator from "../components/Simulator/SimulatorEngine";
import TransitionList from "../components/TransitionList/TransitionList";
import VerificationPanel from "../components/Verification/VerificationPanel";
import TestCasesPanel from "../components/TestCases/TestCasesPanel";
import ExportPanel from "../components/Exports/ExportPanel";
import SaveLoadPanel from "../components/SaveLoad/SaveLoadPanel";
import ExecutionTracer from "../components/Simulation/ExecutionTracer";
import Breakpoints from "../components/Simulation/Breakpoints";

const RightPanel: React.FC = () => {
  const {
    containerRef,
    rightPanelCollapsed,
    setRightPanelCollapsed,
    rightPanelWidth,
    isResizing,
    setIsResizing,
    rightPanelTab,
    handleTabClick,
    getPanelTitle,
    // Props for Panels
    selectedState,
    selectedTransition,
    stateMachine,
    setStateMachine, // <-- Need this for SaveLoadPanel
    selectedTransitionId,
    setSelectedTransitionId,
    simBreakpoints,
    setSimBreakpoints,
    simExecutionHistory,
    simCurrentStepIndex,
    simulationResult,
    setGeneratedTestCases,
    setSelectedStateId,
    createNewMachine, // <-- FIX: Destructure the new function
  } = useEditor();

  return (
    <>
      {/* RESIZER */}
      {!rightPanelCollapsed && (
        <div
          className={`${styles.resizer} ${
            isResizing ? styles.resizerActive : ""
          }`}
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      {/* RIGHT PANEL */}
      <div
        ref={containerRef}
        className={`${styles.rightPanel} ${
          rightPanelCollapsed ? styles.rightPanelCollapsed : ""
        }`}
        style={{
          width: rightPanelCollapsed ? "56px" : `${rightPanelWidth}px`,
        }}
      >
        {rightPanelCollapsed ? (
          // COLLAPSED STATE
          <div className={styles.tabsVertical}>
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className={styles.collapseButton}
              title="Expand Panel"
            >
              <PanelRightOpen size={20} />
            </button>
            <TabButton
              icon={<Settings size={18} />}
              label="Properties"
              id="properties"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<ListTree size={18} />}
              label="Transitions"
              id="transitions"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<PlayCircle size={18} />}
              label="Simulate"
              id="simulator"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<Zap size={18} />}
              label="Animate"
              id="animate"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<FlaskConical size={18} />}
              label="Tests"
              id="testcases"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<CheckCircle2 size={18} />}
              label="Verify"
              id="verification"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<Download size={18} />}
              label="Export"
              id="export"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
            <TabButton
              icon={<Save size={18} />}
              label="Save/Load"
              id="saveload"
              current={rightPanelTab}
              collapsed={true}
              onClick={(id) => {
                handleTabClick(id);
                setRightPanelCollapsed(false);
              }}
            />
          </div>
        ) : (
          // EXPANDED STATE
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
                  <PanelRightClose size={20} />
                </button>
              </div>

              <div className={styles.tabsContainer}>
                <TabButton
                  icon={<Settings size={16} />}
                  label="Properties"
                  id="properties"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<ListTree size={16} />}
                  label="Transitions"
                  id="transitions"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<PlayCircle size={16} />}
                  label="Simulate"
                  id="simulator"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<Zap size={16} />}
                  label="Animate"
                  id="animate"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<FlaskConical size={16} />}
                  label="Tests"
                  id="testcases"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<CheckCircle2 size={16} />}
                  label="Verify"
                  id="verification"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<Download size={16} />}
                  label="Export"
                  id="export"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
                />
                <TabButton
                  icon={<Save size={16} />}
                  label="Save/Load"
                  id="saveload"
                  current={rightPanelTab}
                  collapsed={false}
                  onClick={handleTabClick}
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

              {rightPanelTab === "animate" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    padding: "16px",
                    height: "100%",
                  }}
                >
                  <Breakpoints
                    stateMachine={stateMachine}
                    breakpoints={simBreakpoints}
                    onAddBreakpoint={(id: string) =>
                      setSimBreakpoints(new Set(simBreakpoints.add(id)))
                    }
                    onRemoveBreakpoint={(id: string) => {
                      simBreakpoints.delete(id);
                      setSimBreakpoints(new Set(simBreakpoints));
                    }}
                  />
                  {/* --- EXECUTION TRACER MOVED HERE --- */}
                  <ExecutionTracer
                    executionHistory={simExecutionHistory}
                    currentStep={simCurrentStepIndex + 1}
                    totalSteps={simulationResult ? simulationResult.length : 0}
                  />
                </div>
              )}

              {rightPanelTab === "testcases" && (
                <TestCasesPanel
                  stateMachine={stateMachine}
                  onTestCasesGenerated={setGeneratedTestCases}
                />
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
                  // --- FIX: Use the functions from context ---
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
    </>
  );
};

export default RightPanel;
