// src/pages/CanvasArea.tsx
import React from "react";
import Canvas from "../components/Canvas/Canvas";
import DescriptionPanel from "../components/Canvas/DescriptionPanel";
import SimulationControls from "../components/Simulation/SimulationControls";
import { useEditor } from "./EditorContext";
import styles from "./EditorPage.module.css";
import simStyles from "../components/Simulation/Simulation.module.css";
import { ListVideo, GripVertical, AlertTriangle } from "lucide-react";

const CanvasArea: React.FC = () => {
  const {
    stateMachine,
    setStateMachine,
    isSimulating,
    setSelectedStateId,
    setRightPanelTab,
    setRightPanelCollapsed,
    setSelectedTransitionId,
    isTransitionMode,
    setIsTransitionMode,
    simPlaybackState,
    overlayPos,
    isDraggingOverlay,
    handleOverlayDragStart,
    inputSequence,
    setInputSequence,
    isSimRunning,
    generatedTestCases,
    simError,
    playbackEngine,
    handleStartSimulation,
    handleSimPause,
    handleSimStep,
    handleSimReset,
    handleSimSpeedChange,
    descPanelOpen,
    setDescPanelOpen,
  } = useEditor();

  return (
    <div className={styles.canvasArea}>
      <Canvas
        stateMachine={stateMachine}
        onStateMachineChange={(sm) =>
          setStateMachine({ ...sm, updatedAt: new Date() })
        }
        onSelectState={(id) => {
          if (isSimulating) return;
          setSelectedStateId(id);
          setRightPanelTab("properties");
          if (id) setRightPanelCollapsed(false);
        }}
        onSelectTransition={(id) => {
          if (isSimulating) return;
          setSelectedTransitionId(id);
          if (id) {
            setRightPanelTab("properties");
            setRightPanelCollapsed(false);
          }
        }}
        isTransitionMode={isTransitionMode}
        onTransitionModeChange={setIsTransitionMode}
        simulationStep={isSimulating ? simPlaybackState : null}
      />

      {/* NEW: Simulation UI overlays */}
      {isSimulating && (
        <div className={simStyles.simulationUIOverlay}>
          {/* --- Draggable Input Box --- */}
          <div
            className={simStyles.simulationInputArea}
            style={{
              position: "absolute",
              top: overlayPos.y,
              left: overlayPos.x,
              cursor: isDraggingOverlay ? "grabbing" : "default",
            }}
          >
            <div
              className={simStyles.inputHeader}
              style={{ cursor: "grab" }}
              onMouseDown={handleOverlayDragStart}
            >
              <GripVertical size={16} className="text-gray-400" />
              <ListVideo size={16} />
              Test Case / Input
            </div>

            <select
              className={simStyles.inputTestCaseSelect}
              onChange={(e) => setInputSequence(e.target.value)}
              value={inputSequence}
              disabled={isSimRunning}
            >
              <option value="">-- Custom Input --</option>
              {generatedTestCases.map((test) => (
                <option key={test.id} value={test.inputs.join(" ")}>
                  {test.name}
                </option>
              ))}
            </select>
            <textarea
              className={simStyles.inputTextArea}
              value={inputSequence}
              onChange={(e) => setInputSequence(e.target.value)}
              placeholder="e.g., coin press coin"
              disabled={isSimRunning}
            />
            {simError && (
              <div className={simStyles.errorBox}>
                <AlertTriangle size={16} /> {simError}
              </div>
            )}
          </div>

          {/* --- MINIMAL CONTROLS --- */}
          <div className={simStyles.simulationBottomBar}>
            <SimulationControls
              engine={playbackEngine}
              isRunning={isSimRunning}
              onPlay={handleStartSimulation}
              onPause={handleSimPause}
              onStep={handleSimStep}
              onReset={handleSimReset}
              onSpeedChange={handleSimSpeedChange}
              onRecord={() => {}}
            />
          </div>
        </div>
      )}

      {descPanelOpen && (
        <DescriptionPanel
          onClose={() => setDescPanelOpen(false)}
          stateMachine={stateMachine}
          isOpen={descPanelOpen}
        />
      )}
    </div>
  );
};

export default CanvasArea;
