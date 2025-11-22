import React from "react";
import { State, Transition } from "../../models/types";
import {
  Tag,
  FileText,
  ArrowRightLeft,
  AlertCircle,
  PlayCircle,
} from "lucide-react";

interface PropertyPanelProps {
  selectedState: State | null;
  selectedTransition: Transition | null;
  onStateUpdate: (state: State) => void;
  onTransitionUpdate: (transition: Transition) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedState,
  selectedTransition,
  onStateUpdate,
  onTransitionUpdate,
}) => {
  const panelStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const emptyStateStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#9ca3af",
    padding: "20px",
    textAlign: "center",
  };

  const sectionHeaderStyle: React.CSSProperties = {
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

  const contentStyle: React.CSSProperties = {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    color: "#111827",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    outline: "none",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "80px",
    resize: "vertical",
    lineHeight: "1.5",
  };

  const checkboxGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    color: "#374151",
    cursor: "pointer",
    userSelect: "none",
  };

  if (!selectedState && !selectedTransition) {
    return (
      <div style={panelStyle}>
        <div style={emptyStateStyle}>
          <MousePointer2Icon
            size={48}
            strokeWidth={1}
            style={{ marginBottom: "16px", opacity: 0.5 }}
          />
          <p style={{ margin: 0, fontSize: "0.95rem" }}>
            Select a state or transition on the canvas to view and edit its
            properties.
          </p>
        </div>
      </div>
    );
  }

  if (selectedState) {
    return (
      <div style={panelStyle}>
        <div style={sectionHeaderStyle}>
          <Tag size={18} className="text-blue-600" />
          State Properties
        </div>
        <div style={contentStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={selectedState.name}
              onChange={(e) =>
                onStateUpdate({ ...selectedState, name: e.target.value })
              }
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Type</label>
            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={selectedState.isInitial}
                  onChange={(e) =>
                    onStateUpdate({
                      ...selectedState,
                      isInitial: e.target.checked,
                    })
                  }
                  style={{ accentColor: "#2563eb" }}
                />
                Initial State
              </label>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={selectedState.isFinal}
                  onChange={(e) =>
                    onStateUpdate({
                      ...selectedState,
                      isFinal: e.target.checked,
                    })
                  }
                  style={{ accentColor: "#2563eb" }}
                />
                Final State
              </label>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={selectedState.notes || ""}
              onChange={(e) =>
                onStateUpdate({ ...selectedState, notes: e.target.value })
              }
              style={textareaStyle}
              placeholder="Add optional notes here..."
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedTransition) {
    return (
      <div style={panelStyle}>
        <div style={sectionHeaderStyle}>
          <ArrowRightLeft size={18} className="text-blue-600" />
          Transition Properties
        </div>
        <div style={contentStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Tag size={14} /> Input Event
              </div>
            </label>
            <input
              type="text"
              value={selectedTransition.input || ""}
              onChange={(e) =>
                onTransitionUpdate({
                  ...selectedTransition,
                  input: e.target.value,
                })
              }
              style={inputStyle}
              placeholder="e.g., button_press"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <AlertCircle size={14} /> Guard Condition
              </div>
            </label>
            <input
              type="text"
              value={selectedTransition.guard || ""}
              onChange={(e) =>
                onTransitionUpdate({
                  ...selectedTransition,
                  guard: e.target.value,
                })
              }
              style={inputStyle}
              placeholder="e.g., x > 5"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <PlayCircle size={14} /> Action
              </div>
            </label>
            <input
              type="text"
              value={selectedTransition.action || ""}
              onChange={(e) =>
                onTransitionUpdate({
                  ...selectedTransition,
                  action: e.target.value,
                })
              }
              style={inputStyle}
              placeholder="e.g., x = x + 1"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FileText size={14} /> Output
              </div>
            </label>
            <input
              type="text"
              value={selectedTransition.output || ""}
              onChange={(e) =>
                onTransitionUpdate({
                  ...selectedTransition,
                  output: e.target.value,
                })
              }
              style={inputStyle}
              placeholder="e.g., turn_on_light"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Helper icon for empty state
const MousePointer2Icon = ({
  size,
  strokeWidth,
  style,
}: {
  size: number;
  strokeWidth: number;
  style: React.CSSProperties;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
  </svg>
);

export default PropertyPanel;
