import React, { useState } from "react";
import { StateMachine, Transition } from "../../models/types";
import {
  Edit2,
  Trash2,
  ArrowRight,
  Save,
  X,
  ListFilter,
  ArrowRightLeft,
} from "lucide-react";

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

  const handleEditStart = (transition: Transition) => {
    setEditingId(transition.id);
    setEditInput(transition.input || "");
    setEditOutput(transition.output || "");
  };

  const handleEditSave = (transition: Transition) => {
    onUpdateTransition({ ...transition, input: editInput, output: editOutput });
    setEditingId(null);
  };

  const containerStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#111827",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const itemStyle = (
    isSelected: boolean,
    isEditing: boolean,
  ): React.CSSProperties => ({
    padding: "12px 16px",
    borderRadius: "8px",
    border: `1px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    boxShadow: isEditing
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
    cursor: isEditing ? "default" : "pointer",
  });

  const emptyStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#9ca3af",
    textAlign: "center",
    padding: "20px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "4px",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#111827",
    fontWeight: "500",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.875rem",
    marginBottom: "10px",
  };

  const actionButtonStyle = (color: string): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  });

  if (stateMachine.transitions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <ListFilter size={18} className="text-blue-600" /> All Transitions (0)
        </div>
        <div style={emptyStyle}>
          <ArrowRightLeft
            size={40}
            strokeWidth={1.5}
            style={{ marginBottom: "16px", opacity: 0.5 }}
          />
          <p style={{ margin: 0, fontSize: "0.95rem" }}>
            No transitions yet.
            <br />
            Connect states on the canvas to create one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <ListFilter size={18} className="text-blue-600" />
        All Transitions ({stateMachine.transitions.length})
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
              style={itemStyle(isSelected, isEditing)}
              onClick={() => !isEditing && onSelectTransition(transition.id)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  <span>{fromState?.name || "?"}</span>
                  <ArrowRight size={16} className="text-gray-400" />
                  <span>{toState?.name || "?"}</span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSave(transition);
                        }}
                        style={actionButtonStyle("#059669")}
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        style={actionButtonStyle("#6b7280")}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(transition);
                        }}
                        style={actionButtonStyle("#2563eb")}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransition(transition.id);
                        }}
                        style={actionButtonStyle("#dc2626")}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <div style={labelStyle}>Input</div>
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      style={inputStyle}
                      autoFocus
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Output</div>
                    <input
                      type="text"
                      value={editOutput}
                      onChange={(e) => setEditOutput(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "16px" }}>
                  <div>
                    <div style={labelStyle}>Input</div>
                    <div style={valueStyle}>{transition.input || "—"}</div>
                  </div>
                  <div>
                    <div style={labelStyle}>Output</div>
                    <div style={valueStyle}>{transition.output || "—"}</div>
                  </div>
                  {(transition.guard || transition.action) && (
                    <div>
                      <div style={labelStyle}>Other</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {transition.guard && <span>[G] </span>}
                        {transition.action && <span>(A)</span>}
                      </div>
                    </div>
                  )}
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
