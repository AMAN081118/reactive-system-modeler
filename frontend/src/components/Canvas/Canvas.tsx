import React, { useState, useReducer } from "react";
import {
  State,
  StateMachine,
  Transition,
  CanvasState,
  EditorAction,
} from "../../models/types";
import StateNode from "./StateNode";
import "./Canvas.module.css";

interface CanvasProps {
  stateMachine: StateMachine;
  onStateMachineChange: (sm: StateMachine) => void;
  onSelectState: (stateId: string) => void;
  onSelectTransition: (transitionId: string | null) => void;
  isTransitionMode: boolean;
  onTransitionModeChange: (mode: boolean) => void;
}

const canvasReducer = (
  state: CanvasState,
  action: EditorAction,
): CanvasState => {
  switch (action.type) {
    case "SELECT_STATE":
      return {
        ...state,
        selectedStateId: action.payload,
        selectedTransitionId: null,
      };
    case "DESELECT":
      return { ...state, selectedStateId: null, selectedTransitionId: null };
    case "SET_ZOOM":
      return { ...state, zoom: action.payload };
    default:
      return state;
  }
};

const initialCanvasState: CanvasState = {
  selectedStateId: null,
  selectedTransitionId: null,
  isDragging: false,
  zoom: 1,
};

const NODE_SIZE = 100;
const NODE_RADIUS = NODE_SIZE / 2;
const SELF_LOOP_RADIUS = 60;
const TRANSITION_OFFSET = 15;
const LABEL_OFFSET = 18; // Distance from line to label

/**
 * Simple function to get edge point on circle
 */
function getCircleEdgePoint(
  centerX: number,
  centerY: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: centerX + NODE_RADIUS * Math.cos(angle),
    y: centerY + NODE_RADIUS * Math.sin(angle),
  };
}

/**
 * Get edge point on rectangle
 */
function getRectEdgePoint(
  centerX: number,
  centerY: number,
  angle: number,
): { x: number; y: number } {
  const PI = Math.PI;
  const slope = Math.tan(angle);

  if (angle > -PI / 4 && angle < PI / 4) {
    // Right edge
    return { x: centerX + NODE_RADIUS, y: centerY + NODE_RADIUS * slope };
  } else if (angle >= PI / 4 && angle < (3 * PI) / 4) {
    // Top edge
    return { x: centerX - NODE_RADIUS / slope, y: centerY - NODE_RADIUS };
  } else if (angle >= (3 * PI) / 4 || angle < (-3 * PI) / 4) {
    // Left edge
    return { x: centerX - NODE_RADIUS, y: centerY - NODE_RADIUS * slope };
  } else {
    // Bottom edge
    return { x: centerX + NODE_RADIUS / slope, y: centerY + NODE_RADIUS };
  }
}

/**
 * Get straight arrow line with offset for parallel transitions
 * Returns label position on opposite sides for parallel arrows
 */
function getArrowLine(
  fromState: State,
  toState: State,
  offsetIndex: number,
  allTransitions: Transition[],
): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  labelX: number;
  labelY: number;
} {
  // Centers of states
  const fromCX = fromState.position.x + NODE_RADIUS;
  const fromCY = fromState.position.y + NODE_RADIUS;
  const toCX = toState.position.x + NODE_RADIUS;
  const toCY = toState.position.y + NODE_RADIUS;

  // Vector from source to target
  const dx = toCX - fromCX;
  const dy = toCY - fromCY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Perpendicular direction for offset
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Apply offset for parallel transitions
  const offsetDist = offsetIndex * TRANSITION_OFFSET;
  const offsetFromCX = fromCX + perpX * offsetDist;
  const offsetFromCY = fromCY + perpY * offsetDist;
  const offsetToCX = toCX + perpX * offsetDist;
  const offsetToCY = toCY + perpY * offsetDist;

  // Get edge points
  let x1: number, y1: number, x2: number, y2: number;

  if (fromState.isInitial) {
    const p = getCircleEdgePoint(offsetFromCX, offsetFromCY, angle);
    x1 = p.x;
    y1 = p.y;
  } else {
    const p = getRectEdgePoint(offsetFromCX, offsetFromCY, angle);
    x1 = p.x;
    y1 = p.y;
  }

  if (toState.isInitial) {
    const p = getCircleEdgePoint(offsetToCX, offsetToCY, angle + Math.PI);
    x2 = p.x;
    y2 = p.y;
  } else {
    const p = getRectEdgePoint(offsetToCX, offsetToCY, angle + Math.PI);
    x2 = p.x;
    y2 = p.y;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Calculate label position offset based on which parallel line this is
  // If offsetIndex is positive, place label above line
  // If offsetIndex is negative, place label below line
  const labelOffsetDistance = offsetIndex >= 0 ? LABEL_OFFSET : -LABEL_OFFSET;
  const labelX = midX + perpX * labelOffsetDistance;
  const labelY = midY + perpY * labelOffsetDistance;

  return { x1, y1, x2, y2, midX, midY, labelX, labelY };
}

/**
 * Get self-loop curved path with proper label positioning
 */
function getSelfLoopPath(
  state: State,
  offsetIndex: number,
): { pathD: string; labelX: number; labelY: number } {
  const centerX = state.position.x + NODE_RADIUS;
  const centerY = state.position.y + NODE_RADIUS;

  // Top of circle/rect for loop
  const topY = centerY - NODE_RADIUS;

  // Loop extends above the state
  const loopY = topY - SELF_LOOP_RADIUS;
  const loopLeft = centerX - SELF_LOOP_RADIUS + offsetIndex * 20;
  const loopRight = centerX + SELF_LOOP_RADIUS + offsetIndex * 20;

  // Start and end point (top of state)
  const startX = centerX;
  const startY = topY;

  // Create cubic bezier loop
  const pathD = `M ${startX} ${startY} C ${loopLeft} ${loopY}, ${loopRight} ${loopY}, ${startX} ${startY}`;

  return {
    pathD,
    labelX: centerX + offsetIndex * 15,
    labelY: loopY - 15,
  };
}

/**
 * Get offset index for parallel transitions
 */
function getTransitionOffset(
  transition: Transition,
  allTransitions: Transition[],
): number {
  // Find all transitions between same two states (in either direction)
  const parallels = allTransitions.filter(
    (t) =>
      (t.from === transition.from && t.to === transition.to) ||
      (t.from === transition.to && t.to === transition.from),
  );

  if (parallels.length === 1) return 0;

  // Sort by ID for consistent ordering
  parallels.sort((a, b) => a.id.localeCompare(b.id));

  const index = parallels.findIndex((t) => t.id === transition.id);

  // Center the offsets: -1, 0, 1 for 3 transitions
  return index - Math.floor((parallels.length - 1) / 2);
}

const Canvas: React.FC<CanvasProps> = ({
  stateMachine,
  onStateMachineChange,
  onSelectState,
  onSelectTransition,
  isTransitionMode,
  onTransitionModeChange,
}) => {
  const [canvasState, dispatch] = useReducer(canvasReducer, initialCanvasState);
  const [draggedState, setDraggedState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const [transitionFromState, setTransitionFromState] = useState<string | null>(
    null,
  );

  const handleStateClick = (
    stateId: string,
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (draggedState) return;
    event.stopPropagation();

    if (isTransitionMode) {
      if (!transitionFromState) {
        // First click - select source
        setTransitionFromState(stateId);
        dispatch({ type: "SELECT_STATE", payload: stateId });
        onSelectState(stateId);
      } else if (transitionFromState === stateId) {
        // Same state - create self-loop
        const newTransition: Transition = {
          id: `trans-${Date.now()}`,
          from: stateId,
          to: stateId,
          input: "",
          output: "",
        };

        onStateMachineChange({
          ...stateMachine,
          transitions: [...stateMachine.transitions, newTransition],
        });

        setTransitionFromState(null);
        dispatch({ type: "DESELECT" });
        onSelectState("");
        onSelectTransition(newTransition.id);
      } else {
        // Different state - create normal transition
        const newTransition: Transition = {
          id: `trans-${Date.now()}`,
          from: transitionFromState,
          to: stateId,
          input: "",
          output: "",
        };

        onStateMachineChange({
          ...stateMachine,
          transitions: [...stateMachine.transitions, newTransition],
        });

        setTransitionFromState(null);
        dispatch({ type: "DESELECT" });
        onSelectState("");
        onSelectTransition(newTransition.id);
      }
    } else {
      dispatch({ type: "SELECT_STATE", payload: stateId });
      onSelectState(stateId);
      onSelectTransition(null);
    }
  };

  const handleStateMouseDown = (
    stateId: string,
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (isTransitionMode) return;
    e.preventDefault();
    e.stopPropagation();

    const state = stateMachine.states.find((s) => s.id === stateId);
    if (!state) return;

    setDraggedState({
      id: stateId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: state.position.x,
      initialY: state.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!draggedState) return;

    const deltaX = e.clientX - draggedState.startX;
    const deltaY = e.clientY - draggedState.startY;

    const updatedStates = stateMachine.states.map((state) => {
      if (state.id === draggedState.id) {
        return {
          ...state,
          position: {
            x: draggedState.initialX + deltaX,
            y: draggedState.initialY + deltaY,
          },
        };
      }
      return state;
    });

    onStateMachineChange({
      ...stateMachine,
      states: updatedStates,
    });
  };

  const handleMouseUp = (): void => {
    setDraggedState(null);
  };

  const handleCanvasClick = (): void => {
    if (draggedState) return;
    dispatch({ type: "DESELECT" });
    onSelectState("");
    onSelectTransition(null);
    setTransitionFromState(null);
  };

  const handleZoom = (direction: "in" | "out"): void => {
    const newZoom =
      direction === "in" ? canvasState.zoom * 1.1 : canvasState.zoom / 1.1;
    dispatch({
      type: "SET_ZOOM",
      payload: Math.max(0.5, Math.min(3, newZoom)),
    });
  };

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    border: "1px solid #ccc",
    position: "relative",
    overflow: "hidden",
    backgroundColor: isTransitionMode ? "#f0f8ff" : "#f9f9f9",
  };

  const containerStyle: React.CSSProperties = {
    transform: `scale(${canvasState.zoom})`,
    transformOrigin: "0 0",
    position: "relative",
    width: "100%",
    height: "100%",
  };

  return (
    <div
      style={canvasStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Transition Mode Indicator */}
      {isTransitionMode && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#4caf50",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 100,
          }}
        >
          {transitionFromState
            ? "Click target state (same state = self-loop)"
            : "Click source state"}
        </div>
      )}

      {/* Zoom Controls */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 100 }}>
        <button onClick={() => handleZoom("in")} style={{ marginRight: 5 }}>
          + Zoom
        </button>
        <button onClick={() => handleZoom("out")}>- Zoom</button>
      </div>

      {/* Canvas Container */}
      <div style={containerStyle}>
        {/* States */}
        {stateMachine.states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            isSelected={
              canvasState.selectedStateId === state.id ||
              transitionFromState === state.id
            }
            isTransitionSource={transitionFromState === state.id}
            onClick={(event) => handleStateClick(state.id, event)}
            onMouseDown={(e) => handleStateMouseDown(state.id, e)}
          />
        ))}

        {/* Transitions */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {/* Draw all transitions */}
          {stateMachine.transitions.map((transition) => {
            const fromState = stateMachine.states.find(
              (s) => s.id === transition.from,
            );
            const toState = stateMachine.states.find(
              (s) => s.id === transition.to,
            );

            if (!fromState || !toState) return null;

            const isSelected =
              canvasState.selectedTransitionId === transition.id;
            const isSelfLoop = transition.from === transition.to;

            let pathD: string;
            let labelX: number;
            let labelY: number;

            if (isSelfLoop) {
              // Self-loop
              const offsetIndex = getTransitionOffset(
                transition,
                stateMachine.transitions,
              );
              const loop = getSelfLoopPath(fromState, offsetIndex);
              pathD = loop.pathD;
              labelX = loop.labelX;
              labelY = loop.labelY;
            } else {
              // Regular transition
              const offsetIndex = getTransitionOffset(
                transition,
                stateMachine.transitions,
              );
              const arrow = getArrowLine(
                fromState,
                toState,
                offsetIndex,
                stateMachine.transitions,
              );
              pathD = `M ${arrow.x1} ${arrow.y1} L ${arrow.x2} ${arrow.y2}`;
              labelX = arrow.labelX;
              labelY = arrow.labelY;
            }

            return (
              <g
                key={transition.id}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTransition(transition.id);
                }}
              >
                {/* Path */}
                <path
                  d={pathD}
                  stroke={isSelected ? "#1976d2" : "#666"}
                  strokeWidth={isSelected ? 3 : 2}
                  fill="none"
                  markerEnd={`url(#arrowhead-${isSelected ? "sel" : "norm"})`}
                  style={{ pointerEvents: "stroke" }}
                />

                {/* Label */}
                {(transition.input || transition.output) && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="12"
                    fill={isSelected ? "#1976d2" : "#333"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    style={{
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {transition.input || ""}
                    {transition.input && transition.output ? "/" : ""}
                    {transition.output || ""}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead-norm"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#666" />
            </marker>
            <marker
              id="arrowhead-sel"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#1976d2" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
