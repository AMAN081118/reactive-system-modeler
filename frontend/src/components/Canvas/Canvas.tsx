import React, { useState, useReducer, useRef } from "react";
import {
  State,
  StateMachine,
  Transition,
  CanvasState,
  EditorAction,
  Position,
} from "../../models/types";
import StateNode from "./StateNode";
import styles from "./Canvas.module.css";
import {
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointerClick,
  Move,
} from "lucide-react";

// This is the new prop we will receive
interface SimulationHighlight {
  activeStateId: string | null;
  activeTransitionId: string | null;
}

interface CanvasProps {
  stateMachine: StateMachine;
  onStateMachineChange: (sm: StateMachine) => void;
  onSelectState: (stateId: string) => void;
  onSelectTransition: (transitionId: string | null) => void;
  isTransitionMode: boolean;
  onTransitionModeChange: (mode: boolean) => void;
  simulationStep?: SimulationHighlight | null; // <-- PROP ADDED HERE
}

// --- Geometry Constants & Helpers ---
const NODE_SIZE = 100;
const NODE_RADIUS = NODE_SIZE / 2;
const HANDLE_RADIUS = 6; // Size of the interactive drag handles

function getAngle(p1: Position, p2: Position): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function getCircleEdgePoint(cx: number, cy: number, angle: number): Position {
  return {
    x: cx + NODE_RADIUS * Math.cos(angle),
    y: cy + NODE_RADIUS * Math.sin(angle),
  };
}

function getRectEdgePoint(cx: number, cy: number, angle: number): Position {
  const PI = Math.PI;
  // Normalize angle to -PI to PI for easier quadrant checking
  let normAngle = angle;
  while (normAngle <= -PI) normAngle += 2 * PI;
  while (normAngle > PI) normAngle -= 2 * PI;

  const slope = Math.tan(normAngle);

  if (normAngle > -PI / 4 && normAngle < PI / 4) {
    // Right edge
    return { x: cx + NODE_RADIUS, y: cy + NODE_RADIUS * slope };
  } else if (normAngle >= PI / 4 && normAngle < (3 * PI) / 4) {
    // Bottom edge
    return { x: cx - NODE_RADIUS / slope, y: cy + NODE_RADIUS };
  } else if (
    (normAngle >= (3 * PI) / 4 && normAngle <= PI) ||
    (normAngle >= -PI && normAngle < (-3 * PI) / 4)
  ) {
    // Left edge
    return { x: cx - NODE_RADIUS, y: cy - NODE_RADIUS * slope };
  } else {
    // Top edge
    return { x: cx + NODE_RADIUS / slope, y: cy - NODE_RADIUS };
  }
}

function getNodeBoundaryPoint(state: State, angle: number): Position {
  const cx = state.position.x + NODE_RADIUS;
  const cy = state.position.y + NODE_RADIUS;
  // Use isInitial check from your StateNode logic
  return state.isInitial
    ? getCircleEdgePoint(cx, cy, angle)
    : getRectEdgePoint(cx, cy, angle);
}

// Calculates the full geometry for a generic transition (including self-loops)
function getTransitionGeometry(
  fromState: State,
  toState: State,
  transition: Transition,
) {
  // 1. Determine Angles (use stored values or calculate smart defaults)
  let sourceAngle = transition.sourceAngle;
  let targetAngle = transition.targetAngle;

  if (sourceAngle === undefined || targetAngle === undefined) {
    const fromCX = fromState.position.x + NODE_RADIUS;
    const fromCY = fromState.position.y + NODE_RADIUS;
    const toCX = toState.position.x + NODE_RADIUS;
    const toCY = toState.position.y + NODE_RADIUS;

    // Calculate defaults if this is an old transition without stored angles
    if (fromState.id === toState.id) {
      // Default self-loop angles (top-left to top-right)
      sourceAngle = sourceAngle ?? -Math.PI / 1.2; // ~ -150 degrees
      targetAngle = targetAngle ?? -Math.PI / 4; // ~ -45 degrees
    } else {
      // Default straight line angles
      const angle = Math.atan2(toCY - fromCY, toCX - fromCX);
      sourceAngle = sourceAngle ?? angle;
      targetAngle = targetAngle ?? angle + Math.PI;
    }
  }

  // 2. Calculate start and end points on node boundaries
  const startPos = getNodeBoundaryPoint(fromState, sourceAngle);
  const endPos = getNodeBoundaryPoint(toState, targetAngle);

  // 3. Calculate Control Point
  const midX = (startPos.x + endPos.x) / 2;
  const midY = (startPos.y + endPos.y) / 2;

  // Use stored control offset or default to 0,0 (straight line)
  // For self-loops, default to a slight upward curve if no offset exists
  const defaultOffset =
    fromState.id === toState.id && !transition.controlOffset
      ? { x: 0, y: -80 }
      : { x: 0, y: 0 };

  const offsetX = transition.controlOffset?.x ?? defaultOffset.x;
  const offsetY = transition.controlOffset?.y ?? defaultOffset.y;

  const controlPos = {
    x: midX + offsetX,
    y: midY + offsetY,
  };

  // 4. Determine Label Position (at the peak of the curve, t=0.5)
  const t = 0.5;
  const labelX =
    (1 - t) * (1 - t) * startPos.x +
    2 * (1 - t) * t * controlPos.x +
    t * t * endPos.x;
  const labelY =
    (1 - t) * (1 - t) * startPos.y +
    2 * (1 - t) * t * controlPos.y +
    t * t * endPos.y;

  // 5. Generate Path Data (Quadratic Bezier: M start Q control end)
  const pathD = `M ${startPos.x} ${startPos.y} Q ${controlPos.x} ${controlPos.y} ${endPos.x} ${endPos.y}`;

  // 6. Calculate arrow angle for correct marker orientation
  // Tangent at end point (t=1) for quadratic bezier is proportional to (End - Control)
  const arrowAngleRad = Math.atan2(
    endPos.y - controlPos.y,
    endPos.x - controlPos.x,
  );
  const arrowAngleDeg = (arrowAngleRad * 180) / Math.PI;

  return {
    pathD,
    startPos,
    endPos,
    controlPos,
    midPos: { x: midX, y: midY },
    labelPos: { x: labelX, y: labelY },
    arrowAngle: arrowAngleDeg,
    // Return effective angles for handle rendering if needed
    sourceAngle,
    targetAngle,
  };
}

// Local reducer for purely UI state (selection, zoom)
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
    case "SELECT_TRANSITION":
      return {
        ...state,
        selectedStateId: null,
        // Ensure we handle null payload if passed, though typings might need strict check
        selectedTransitionId: action.payload,
      };
    case "DESELECT":
      return { ...state, selectedStateId: null, selectedTransitionId: null };
    case "SET_ZOOM":
      return { ...state, zoom: action.payload };
    default:
      // Ignore other editor actions that don't affect local UI state
      return state;
  }
};

const initialCanvasState: CanvasState = {
  selectedStateId: null,
  selectedTransitionId: null,
  isDragging: false,
  zoom: 1,
};

const Canvas: React.FC<CanvasProps> = ({
  stateMachine,
  onStateMachineChange,
  onSelectState,
  onSelectTransition,
  isTransitionMode,
  onTransitionModeChange,
  simulationStep, // <-- USING THE NEW PROP
}) => {
  const [canvasState, dispatch] = useReducer(canvasReducer, initialCanvasState);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartX, setPanStartX] = useState(0);
  const [panStartY, setPanStartY] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Drag states
  const [draggedState, setDraggedState] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const [draggedHandle, setDraggedHandle] = useState<{
    transitionId: string;
    type: "source" | "target" | "control";
  } | null>(null);

  const [transitionFromState, setTransitionFromState] = useState<string | null>(
    null,
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Event Handlers ---

  const handleStateClick = (
    stateId: string,
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (simulationStep) return; // Disable clicks during simulation
    if (draggedState || draggedHandle || isPanning) return;
    event.stopPropagation();

    if (isTransitionMode) {
      if (!transitionFromState) {
        setTransitionFromState(stateId);
        dispatch({ type: "SELECT_STATE", payload: stateId });
        onSelectState(stateId);
      } else {
        // Complete the transition
        createTransition(transitionFromState, stateId);
      }
    } else {
      dispatch({ type: "SELECT_STATE", payload: stateId });
      onSelectState(stateId);
      onSelectTransition(null);
    }
  };

  const createTransition = (fromId: string, toId: string) => {
    const newTransition: Transition = {
      id: `trans-${Date.now()}`,
      from: fromId,
      to: toId,
      // Optional fields from your types.ts
      input: undefined,
      output: undefined,
      guard: undefined,
      action: undefined,
      // Initialize geometry fields as undefined to let helper calculate defaults
      sourceAngle: undefined,
      targetAngle: undefined,
      controlOffset: undefined,
    };

    onStateMachineChange({
      ...stateMachine,
      transitions: [...stateMachine.transitions, newTransition],
    });

    setTransitionFromState(null);
    dispatch({ type: "DESELECT" });
    onSelectState("");
    // Optionally auto-select new transition and exit mode
    onTransitionModeChange(false);
    dispatch({ type: "SELECT_TRANSITION", payload: newTransition.id });
    onSelectTransition(newTransition.id);
  };

  const handleStateMouseDown = (
    stateId: string,
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (simulationStep) return; // Disable drag during simulation
    if (isTransitionMode || e.button !== 0) return; // Only left click
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

  const handleHandleMouseDown = (
    e: React.MouseEvent,
    transitionId: string,
    type: "source" | "target" | "control",
  ) => {
    if (simulationStep) return; // Disable handle drag during simulation
    e.preventDefault();
    e.stopPropagation();
    setDraggedHandle({ transitionId, type });
  };

  // Unified Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    // 1. Panning
    if (isPanning) {
      setPanX((panX) => panX + (e.clientX - panStartX));
      setPanY((panY) => panY + (e.clientY - panStartY));
      setPanStartX(e.clientX);
      setPanStartY(e.clientY);
      return;
    }

    const zoom = canvasState.zoom;

    // 2. Node Dragging
    if (draggedState) {
      const deltaX = (e.clientX - draggedState.startX) / zoom;
      const deltaY = (e.clientY - draggedState.startY) / zoom;

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

      onStateMachineChange({ ...stateMachine, states: updatedStates });
      return;
    }

    // 3. Transition Handle Dragging
    if (draggedHandle) {
      const transition = stateMachine.transitions.find(
        (t) => t.id === draggedHandle.transitionId,
      );
      if (!transition) return;

      const fromState = stateMachine.states.find(
        (s) => s.id === transition.from,
      )!;
      const toState = stateMachine.states.find((s) => s.id === transition.to)!;
      const geo = getTransitionGeometry(fromState, toState, transition);

      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Calculate mouse position in "Canvas World" coordinates
      const mouseX = (e.clientX - rect.left - panX) / zoom;
      const mouseY = (e.clientY - rect.top - panY) / zoom;

      let updatedTransition = { ...transition };

      if (draggedHandle.type === "source") {
        const center = {
          x: fromState.position.x + NODE_RADIUS,
          y: fromState.position.y + NODE_RADIUS,
        };
        updatedTransition.sourceAngle = getAngle(center, {
          x: mouseX,
          y: mouseY,
        });
      } else if (draggedHandle.type === "target") {
        const center = {
          x: toState.position.x + NODE_RADIUS,
          y: toState.position.y + NODE_RADIUS,
        };
        updatedTransition.targetAngle = getAngle(center, {
          x: mouseX,
          y: mouseY,
        });
      } else if (draggedHandle.type === "control") {
        // New offset is the difference between current mouse pos and the straight-line midpoint
        updatedTransition.controlOffset = {
          x: mouseX - geo.midPos.x,
          y: mouseY - geo.midPos.y,
        };
      }

      onStateMachineChange({
        ...stateMachine,
        transitions: stateMachine.transitions.map((t) =>
          t.id === transition.id ? updatedTransition : t,
        ),
      });
    }
  };

  const handleMouseUp = (): void => {
    setDraggedState(null);
    setDraggedHandle(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (): void => {
    if (simulationStep) return; // Disable clicks during simulation
    if (draggedState || draggedHandle || isPanning) return;
    dispatch({ type: "DESELECT" });
    onSelectState("");
    onSelectTransition(null);
    setTransitionFromState(null);
  };

  const handleTransitionClick = (e: React.MouseEvent, transitionId: string) => {
    if (simulationStep) return; // Disable clicks during simulation
    e.stopPropagation();
    dispatch({ type: "SELECT_TRANSITION", payload: transitionId });
    onSelectTransition(transitionId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, canvasState.zoom * delta));
    dispatch({ type: "SET_ZOOM", payload: newZoom });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Middle mouse or Alt+Left Click to pan
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStartX(e.clientX);
      setPanStartY(e.clientY);
    }
  };

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    transform: `translate(${panX}px, ${panY}px) scale(${canvasState.zoom})`,
    transformOrigin: "0 0",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transition:
      isPanning || draggedState || draggedHandle
        ? "none"
        : "transform 0.1s ease-out",
  };

  const zoomControlsStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    padding: "4px",
    border: "1px solid #e5e7eb",
  };

  const zoomButtonStyle: React.CSSProperties = {
    padding: "8px",
    backgroundColor: "transparent",
    color: "#4b5563",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const zoomDividerStyle: React.CSSProperties = {
    width: "1px",
    height: "24px",
    backgroundColor: "#e5e7eb",
    margin: "0 4px",
  };

  const infoStyle: React.CSSProperties = {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    color: "#374151",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "0.875rem",
    zIndex: 100,
    display: showInfo ? "block" : "none",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid rgba(229, 231, 235, 0.5)",
    maxWidth: "260px",
  };

  const infoHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "8px",
    fontSize: "0.95rem",
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
    fontSize: "0.85rem",
  };

  const instructionStyle: React.CSSProperties = {
    position: "absolute",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(31, 41, 55, 0.9)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "500",
    zIndex: 100,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(4px)",
  };

  const infoToggleStyle: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px",
    cursor: "pointer",
    color: "#4b5563",
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  };

  return (
    <div
      id="fsm-canvas"
      ref={canvasRef}
      className={styles.canvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      {/* UI Controls */}
      {!simulationStep && ( // Hide info toggle during simulation
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={infoToggleStyle}
          title={showInfo ? "Hide Info" : "Show Info"}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#4b5563";
          }}
        >
          <Info size={20} />
        </button>
      )}

      {showInfo &&
        !simulationStep && ( // Hide info box during simulation
          <div style={infoStyle}>
            <div style={infoHeaderStyle}>
              <MousePointerClick size={16} className="text-blue-600" />
              Canvas Controls
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: "#6b7280" }}>Zoom:</span>
              <span style={{ fontWeight: "600" }}>
                {(canvasState.zoom * 100).toFixed(0)}%
              </span>
            </div>
            <div style={infoRowStyle}>
              <span style={{ color: "#6b7280" }}>Position:</span>
              <span style={{ fontFamily: "monospace" }}>
                ({panX.toFixed(0)}, {panY.toFixed(0)})
              </span>
            </div>
            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #e5e7eb",
                fontSize: "0.75rem",
                color: "#6b7280",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Move size={14} /> Middle-click + drag to pan
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ZoomIn size={14} /> Scroll to zoom in/out
              </div>
            </div>
          </div>
        )}

      {isTransitionMode && (
        <div style={instructionStyle}>
          {transitionFromState
            ? "🎯 Click target state to complete transition"
            : "🎯 Click source state to start transition"}
        </div>
      )}

      {!simulationStep && ( // Hide zoom controls during simulation playback
        <div style={zoomControlsStyle}>
          <button
            onClick={() =>
              dispatch({
                type: "SET_ZOOM",
                payload: Math.max(0.3, canvasState.zoom * 0.9),
              })
            }
            style={zoomButtonStyle}
            title="Zoom Out"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <ZoomOut size={20} />
          </button>
          <div style={zoomDividerStyle} />
          <button
            onClick={() => {
              dispatch({ type: "SET_ZOOM", payload: 1 });
              setPanX(0);
              setPanY(0);
            }}
            style={zoomButtonStyle}
            title="Reset View"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <RotateCcw size={18} />
          </button>
          <div style={zoomDividerStyle} />
          <button
            onClick={() =>
              dispatch({
                type: "SET_ZOOM",
                payload: Math.min(3, canvasState.zoom * 1.1),
              })
            }
            style={zoomButtonStyle}
            title="Zoom In"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <ZoomIn size={20} />
          </button>
        </div>
      )}

      {/* Main Canvas Content */}
      <div style={containerStyle}>
        {/* Nodes */}
        {stateMachine.states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            isSelected={
              !simulationStep && canvasState.selectedStateId === state.id
            }
            isTransitionSource={
              !simulationStep && transitionFromState === state.id
            }
            // NEW: Pass simulation active state
            isSimulationActive={simulationStep?.activeStateId === state.id}
            onClick={(event) => handleStateClick(state.id, event)}
            onMouseDown={(e) => handleStateMouseDown(state.id, e)}
          />
        ))}

        {/* Transitions Layer */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <defs>
            <marker
              id="arrowhead-norm"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-sel"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
            <marker
              id="arrowhead-sim"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          {stateMachine.transitions.map((transition) => {
            const fromState = stateMachine.states.find(
              (s) => s.id === transition.from,
            );
            const toState = stateMachine.states.find(
              (s) => s.id === transition.to,
            );
            if (!fromState || !toState) return null;

            // Determine state
            const isSelected =
              !simulationStep &&
              canvasState.selectedTransitionId === transition.id;
            const isSimActive =
              simulationStep?.activeTransitionId === transition.id;

            const geo = getTransitionGeometry(fromState, toState, transition);

            let strokeColor = "#94a3b8";
            let strokeWidth = 2;
            let markerId = "arrowhead-norm";
            let zIndex = 0;

            if (isSelected) {
              strokeColor = "#3b82f6";
              strokeWidth = 3;
              markerId = "arrowhead-sel";
              zIndex = 1;
            }
            if (isSimActive) {
              strokeColor = "#10b981";
              strokeWidth = 4;
              markerId = "arrowhead-sim";
              zIndex = 2;
            }

            return (
              <g
                key={transition.id}
                onClick={(e) => handleTransitionClick(e, transition.id)}
                style={{
                  pointerEvents: simulationStep ? "none" : "all",
                  cursor: "pointer",
                  zIndex: zIndex,
                }}
              >
                <path
                  d={geo.pathD}
                  stroke="transparent"
                  strokeWidth="15"
                  fill="none"
                />
                <path
                  d={geo.pathD}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  markerEnd={`url(#${markerId})`}
                  style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                />

                {(transition.input ||
                  transition.output ||
                  transition.guard ||
                  transition.action) && (
                  <g
                    transform={`translate(${geo.labelPos.x}, ${geo.labelPos.y})`}
                  >
                    <rect
                      x="-36"
                      y="-14"
                      width="72"
                      height="28"
                      fill="white"
                      stroke={
                        isSimActive
                          ? "#10b981"
                          : isSelected
                          ? "#3b82f6"
                          : "#e2e8f0"
                      }
                      strokeWidth={isSimActive || isSelected ? 2 : 1}
                      rx="6"
                      style={{ transition: "stroke 0.2s" }}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fill={
                        isSimActive
                          ? "#065f46"
                          : isSelected
                          ? "#1e3a8a"
                          : "#475569"
                      }
                      fontWeight={isSimActive || isSelected ? "600" : "500"}
                      style={{
                        userSelect: "none",
                        pointerEvents: "none",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {[transition.input, transition.output]
                        .filter(Boolean)
                        .join(" / ")}
                    </text>
                  </g>
                )}

                {isSelected && !simulationStep && (
                  <>
                    <path
                      d={`M ${geo.startPos.x} ${geo.startPos.y} L ${geo.controlPos.x} ${geo.controlPos.y} L ${geo.endPos.x} ${geo.endPos.y}`}
                      stroke="#cbd5e1"
                      strokeDasharray="4,4"
                      strokeWidth="1.5"
                      fill="none"
                      pointerEvents="none"
                    />
                    <circle
                      cx={geo.startPos.x}
                      cy={geo.startPos.y}
                      r={HANDLE_RADIUS}
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        cursor: "pointer",
                        filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                      }}
                      onMouseDown={(e) =>
                        handleHandleMouseDown(e, transition.id, "source")
                      }
                    />
                    <circle
                      cx={geo.endPos.x}
                      cy={geo.endPos.y}
                      r={HANDLE_RADIUS}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        cursor: "pointer",
                        filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                      }}
                      onMouseDown={(e) =>
                        handleHandleMouseDown(e, transition.id, "target")
                      }
                    />
                    <circle
                      cx={geo.controlPos.x}
                      cy={geo.controlPos.y}
                      r={HANDLE_RADIUS}
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        cursor: "move",
                        filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                      }}
                      onMouseDown={(e) =>
                        handleHandleMouseDown(e, transition.id, "control")
                      }
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
