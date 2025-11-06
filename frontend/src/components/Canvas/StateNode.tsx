import React from "react";
import { State } from "../../models/types";

interface StateNodeProps {
  state: State;
  isSelected: boolean;
  isTransitionSource?: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const StateNode: React.FC<StateNodeProps> = ({
  state,
  isSelected,
  isTransitionSource,
  onClick,
  onMouseDown,
}) => {
  const nodeStyle: React.CSSProperties = {
    position: "absolute",
    left: state.position.x,
    top: state.position.y,
    width: 100,
    height: 100,
    borderRadius: state.isInitial ? "50%" : "8px",
    border: `3px solid ${
      isTransitionSource ? "#4caf50" : isSelected ? "#1976d2" : "#333"
    }`,
    backgroundColor: state.isFinal ? "#fff59d" : "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "move",
    userSelect: "none",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    boxShadow: isTransitionSource
      ? "0 0 15px #4caf50"
      : isSelected
      ? "0 0 10px #1976d2"
      : "none",
  };

  // Stop propagation to prevent canvas click from firing
  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    onClick(e);
  };

  return (
    <div
      style={nodeStyle}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`State: ${state.name}`}
    >
      <div style={{ textAlign: "center" }}>
        {state.isInitial && <div style={{ fontSize: "0.8em" }}>→</div>}
        <div>{state.name}</div>
        {state.isInitial && (
          <div style={{ fontSize: "0.7em", marginTop: 4 }}>Initial</div>
        )}
      </div>
    </div>
  );
};

export default StateNode;
