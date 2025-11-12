import React from "react";
import { State } from "../../models/types";
import styles from "./Canvas.module.css";

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
  // Combine classes based on state properties
  let className = styles.stateNode;
  if (isSelected) className += ` ${styles.stateNodeSelected}`;
  if (isTransitionSource) className += ` ${styles.stateNodeSource}`;
  if (state.isFinal) className += ` ${styles.stateNodeFinal}`;
  if (state.isInitial) className += ` ${styles.stateNodeInitial}`;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    onClick(e);
  };

  return (
    <div
      className={className}
      style={{
        left: state.position.x,
        top: state.position.y,
      }}
      onMouseDown={onMouseDown}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`State: ${state.name}`}
    >
      <div className={styles.stateName}>{state.name}</div>
      {state.isInitial && <div className={styles.initialIndicator}>Start</div>}
    </div>
  );
};

export default StateNode;
