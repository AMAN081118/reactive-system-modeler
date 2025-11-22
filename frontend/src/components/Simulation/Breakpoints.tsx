// components/Simulation/Breakpoints.tsx
import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import styles from "./Simulation.module.css";
import { Dot, Trash2, AlertTriangle } from "lucide-react";

interface BreakpointsProps {
  stateMachine: StateMachine;
  breakpoints: Set<string>;
  onAddBreakpoint: (id: string) => void;
  onRemoveBreakpoint: (id: string) => void;
}

const Breakpoints: React.FC<BreakpointsProps> = ({
  stateMachine,
  breakpoints,
  onAddBreakpoint,
  onRemoveBreakpoint,
}) => {
  const [selectedState, setSelectedState] = useState<string>("");

  const handleAddClick = () => {
    if (selectedState && !breakpoints.has(selectedState)) {
      onAddBreakpoint(selectedState);
    }
  };

  const stateMap = new Map(stateMachine.states.map((s) => [s.id, s.name]));

  return (
    <div className={styles.breakpointsContainer}>
      <h4 className={styles.breakpointsHeader}>
        <AlertTriangle size={16} style={{ marginRight: "8px" }} />
        Breakpoints
      </h4>
      <div className={styles.breakpointsAdd}>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="">-- Select a state to add breakpoint --</option>
          {stateMachine.states
            .filter((s) => !breakpoints.has(s.id)) // Only show states without a breakpoint
            .map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
        </select>
        <button onClick={handleAddClick} disabled={!selectedState}>
          Add
        </button>
      </div>
      <div className={styles.breakpointsList}>
        {Array.from(breakpoints).map((id) => (
          <div key={id} className={styles.breakpointItem}>
            <span>
              <Dot
                size={16}
                color="var(--danger-color)"
                style={{ verticalAlign: "middle", marginRight: "4px" }}
              />
              {stateMap.get(id) || "Unknown State"}
            </span>
            <button
              onClick={() => onRemoveBreakpoint(id)}
              title="Remove breakpoint"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Breakpoints;
