import React, { useState } from "react";
import { StateMachine, Transition } from "../../models/types";

interface TransitionListProps {
  stateMachine: StateMachine;
  selectedTransitionId: string | null;
  onSelectTransition: (transitionId: string) => void;
  onDeleteTransition: (transitionId: string) => void;
  onUpdateTransition: (transition: Transition) => void;
}

const TransitionList: React.FC<TransitionListProps> = ({
  stateMachine,
  selectedTransitionId,
  onSelectTransition,
  onDeleteTransition,
  onUpdateTransition,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>("");
  const [editOutput, setEditOutput] = useState<string>("");

  const handleEditStart = (transition: Transition): void => {
    setEditingId(transition.id);
    setEditInput(transition.input || "");
    setEditOutput(transition.output || "");
  };

  const handleEditSave = (transition: Transition): void => {
    onUpdateTransition({
      ...transition,
      input: editInput,
      output: editOutput,
    });
    setEditingId(null);
  };

  const handleEditCancel = (): void => {
    setEditingId(null);
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const headerStyle: React.CSSProperties = {
    padding: "15px",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
  };

  const itemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "8px",
    backgroundColor: isSelected ? "#e3f2fd" : "white",
    borderLeft: isSelected ? "4px solid #1976d2" : "4px solid transparent",
    cursor: "pointer",
  });

  const itemHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "0.9em",
  };

  const stateNameStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85em",
    color: "#666",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: "bold",
    color: "#333",
    padding: "4px 8px",
    backgroundColor: "#f0f0f0",
    borderRadius: "3px",
    fontSize: "0.8em",
  };

  const inputOutputStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "8px",
  };

  const fieldStyle: React.CSSProperties = {
    fontSize: "0.85em",
  };

  const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "bold",
    fontSize: "0.75em",
    marginBottom: "3px",
    color: "#555",
  };

  const fieldInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "4px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    fontSize: "0.8em",
    boxSizing: "border-box",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
  };

  const smallButtonStyle = (color: string): React.CSSProperties => ({
    padding: "4px 12px",
    backgroundColor: color,
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.75em",
    fontWeight: "bold",
  });

  const emptyMessageStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#999",
    textAlign: "center",
    fontSize: "0.9em",
  };

  if (stateMachine.transitions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          Transitions ({stateMachine.transitions.length})
        </div>
        <div style={emptyMessageStyle}>
          <div>
            No transitions yet.
            <br /> Use "Add Transition" to create one.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        Transitions ({stateMachine.transitions.length})
      </div>

      <div style={listStyle}>
        {stateMachine.transitions.map((transition) => {
          const fromState = stateMachine.states.find(
            (s) => s.id === transition.from,
          );
          const toState = stateMachine.states.find(
            (s) => s.id === transition.to,
          );
          const isSelected = selectedTransitionId === transition.id;
          const isEditing = editingId === transition.id;

          return (
            <div
              key={transition.id}
              style={itemStyle(isSelected)}
              onClick={() => onSelectTransition(transition.id)}
            >
              {/* Header with transition info */}
              <div style={itemHeaderStyle}>
                <div style={stateNameStyle}>
                  <strong>{fromState?.name || "Unknown"}</strong>
                  <span>→</span>
                  <strong>{toState?.name || "Unknown"}</strong>
                </div>
                <div style={buttonGroupStyle}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSave(transition);
                        }}
                        style={smallButtonStyle("#4caf50")}
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCancel();
                        }}
                        style={smallButtonStyle("#999")}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(transition);
                        }}
                        style={smallButtonStyle("#1976d2")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransition(transition.id);
                        }}
                        style={smallButtonStyle("#f44336")}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Input/Output display or edit */}
              {isEditing ? (
                <div
                  style={inputOutputStyle}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={fieldStyle}>
                    <label style={fieldLabelStyle}>Input</label>
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      style={fieldInputStyle}
                      placeholder="e.g., event1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div style={fieldStyle}>
                    <label style={fieldLabelStyle}>Output</label>
                    <input
                      type="text"
                      value={editOutput}
                      onChange={(e) => setEditOutput(e.target.value)}
                      style={fieldInputStyle}
                      placeholder="e.g., action1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              ) : (
                <div style={inputOutputStyle}>
                  <div style={fieldStyle}>
                    <span style={fieldLabelStyle}>Input:</span>
                    <span style={labelStyle}>{transition.input || "—"}</span>
                  </div>
                  <div style={fieldStyle}>
                    <span style={fieldLabelStyle}>Output:</span>
                    <span style={labelStyle}>{transition.output || "—"}</span>
                  </div>
                </div>
              )}

              {/* Optional: Guard and Action info */}
              {(transition.guard || transition.action) && !isEditing && (
                <div
                  style={{
                    fontSize: "0.75em",
                    color: "#666",
                    marginTop: "6px",
                  }}
                >
                  {transition.guard && <div>Guard: {transition.guard}</div>}
                  {transition.action && <div>Action: {transition.action}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransitionList;
