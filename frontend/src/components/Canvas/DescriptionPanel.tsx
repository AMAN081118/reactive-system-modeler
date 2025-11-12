import React from "react";
import { StateMachine } from "../../models/types";
import {
  X,
  Info,
  BarChart3,
  Link2,
  PlayCircle,
  Flag,
  RotateCcw,
  BookOpen,
} from "lucide-react";

interface DescriptionPanelProps {
  stateMachine: StateMachine;
  isOpen: boolean;
  onClose: () => void;
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({
  stateMachine,
  isOpen,
  onClose,
}) => {
  const panelStyle: React.CSSProperties = {
    position: "absolute",
    left: isOpen ? 20 : "-360px",
    top: 20,
    width: "340px",
    maxHeight: "calc(100vh - 40px)",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    padding: "0",
    zIndex: 50,
    overflowY: "auto",
    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.125rem",
    color: "#111827",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  };

  const contentStyle: React.CSSProperties = {
    padding: "20px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "24px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "0.95rem",
    color: "#374151",
    lineHeight: "1.6",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#6b7280",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
  };

  const listStyle: React.CSSProperties = {
    margin: "0",
    padding: "0",
    listStyle: "none",
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  };

  const listItemStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "0.875rem",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const badgeStyle = (
    bgColor: string,
    textColor: string,
  ): React.CSSProperties => ({
    fontSize: "0.65rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "9999px",
    backgroundColor: bgColor,
    color: textColor,
    textTransform: "uppercase",
  });

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "24px",
    display: "flex",
    gap: "12px",
  };

  // Get stats
  const initialStates = stateMachine.states.filter((s) => s.isInitial);
  const finalStates = stateMachine.states.filter((s) => s.isFinal);
  const selfLoops = stateMachine.transitions.filter((t) => t.from === t.to);

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          <Info size={20} className="text-blue-600" />
          Machine Details
        </h3>
        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={contentStyle}>
        <div style={sectionStyle}>
          <div style={labelStyle}>System Name</div>
          <div
            style={{
              ...valueStyle,
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {stateMachine.name || "Untitled System"}
          </div>
        </div>

        {stateMachine.description && (
          <div style={sectionStyle}>
            <div style={labelStyle}>Description</div>
            <div style={valueStyle}>{stateMachine.description}</div>
          </div>
        )}

        <div style={sectionStyle}>
          <div style={labelStyle}>Statistics</div>
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <BarChart3 size={14} /> States
              </div>
              <div style={statValueStyle}>{stateMachine.states.length}</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <Link2 size={14} /> Transitions
              </div>
              <div style={statValueStyle}>
                {stateMachine.transitions.length}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <PlayCircle size={14} /> Initial
              </div>
              <div style={statValueStyle}>{initialStates.length}</div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>
                <Flag size={14} /> Final
              </div>
              <div style={statValueStyle}>{finalStates.length}</div>
            </div>
          </div>
          <div
            style={{
              ...statCardStyle,
              marginTop: "12px",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={statLabelStyle}>
              <RotateCcw size={14} /> Self-Loops
            </div>
            <div style={{ ...statValueStyle, fontSize: "1rem" }}>
              {selfLoops.length}
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Type</div>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              backgroundColor:
                stateMachine.type === "mealy" ? "#f0f9ff" : "#fdf2f8",
              color: stateMachine.type === "mealy" ? "#0369a1" : "#be185d",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              border: `1px solid ${
                stateMachine.type === "mealy" ? "#bae6fd" : "#fbcfe8"
              }`,
            }}
          >
            {stateMachine.type === "mealy" ? "Mealy Machine" : "Moore Machine"}
          </div>
        </div>

        <div style={{ marginBottom: 0 }}>
          <div style={labelStyle}>States Overview</div>
          {stateMachine.states.length === 0 ? (
            <div
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                fontStyle: "italic",
                padding: "12px",
                textAlign: "center",
                border: "1px dashed #e5e7eb",
                borderRadius: "8px",
              }}
            >
              No states defined yet.
            </div>
          ) : (
            <ul style={listStyle}>
              {stateMachine.states.map((state, index) => (
                <li
                  key={state.id}
                  style={{
                    ...listItemStyle,
                    borderBottom:
                      index === stateMachine.states.length - 1
                        ? "none"
                        : "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>{state.name}</span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {state.isInitial && (
                      <span style={badgeStyle("#dcfce7", "#166534")}>
                        Start
                      </span>
                    )}
                    {state.isFinal && (
                      <span style={badgeStyle("#fee2e2", "#991b1b")}>
                        Final
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {stateMachine.id.startsWith("example-") && (
          <div style={infoBoxStyle}>
            <BookOpen size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <div
                style={{
                  fontWeight: "600",
                  color: "#1e40af",
                  marginBottom: "4px",
                }}
              >
                Textbook Reference
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#1e3a8a",
                  lineHeight: "1.5",
                }}
              >
                This model is adapted from an example in the{" "}
                <em>Cyber-Physical Systems</em> textbook.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionPanel;
