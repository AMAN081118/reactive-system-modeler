// components/Simulation/SimulationControls.tsx
import React from "react";
import { SimulationPlaybackEngine } from "../../services/SimulationPlaybackEngine";
import { Play, Pause, StepForward, RotateCcw, Gauge } from "lucide-react";
import styles from "./Simulation.module.css";

interface SimulationControlsProps {
  engine: SimulationPlaybackEngine;
  isRunning: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onRecord: () => void; // This was in EditorPage.tsx, but unused. Added for completeness.
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}) => {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpeedChange(Number(e.target.value));
  };

  return (
    <div className={styles.controlsContainer}>
      <button
        className={styles.controlButton}
        onClick={onReset}
        title="Reset Simulation"
        disabled={isRunning}
      >
        <RotateCcw size={18} />
      </button>

      {!isRunning ? (
        <button
          className={`${styles.controlButton} ${styles.playButton}`}
          onClick={onPlay}
          title="Play Simulation"
        >
          <Play size={18} />
        </button>
      ) : (
        <button
          className={styles.controlButton}
          onClick={onPause}
          title="Pause Simulation"
        >
          <Pause size={18} />
        </button>
      )}

      <button
        className={styles.controlButton}
        onClick={onStep}
        title="Step Forward"
        disabled={isRunning}
      >
        <StepForward size={18} />
      </button>

      <div className={styles.speedControl}>
        <label htmlFor="speed-select" title="Playback Speed">
          <Gauge size={16} />
        </label>
        <select
          id="speed-select"
          defaultValue="1"
          onChange={handleSpeedChange}
          disabled={isRunning}
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2.0x</option>
        </select>
      </div>
    </div>
  );
};

export default SimulationControls;
