import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { exampleMachines } from "../../data/exampleMachines";
import {
  X,
  BookOpen,
  Layers,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";

interface ExamplesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadExample: (machine: StateMachine) => void;
}

const ExamplesSidebar: React.FC<ExamplesSidebarProps> = ({
  isOpen,
  onClose,
  onLoadExample,
}) => {
  const handleLoadExample = (machine: StateMachine) => {
    const freshMachine: StateMachine = {
      ...machine,
      id: `example-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onLoadExample(freshMachine);
    onClose();
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(2px)",
    zIndex: 1999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: isOpen ? 0 : "-420px",
    width: "400px",
    height: "100vh",
    backgroundColor: "#ffffff",
    boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.1)",
    transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.25rem",
    color: "#111827",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    backgroundColor: "#f9fafb",
  };

  const introTextStyle: React.CSSProperties = {
    color: "#4b5563",
    fontSize: "0.95rem",
    marginBottom: "24px",
    lineHeight: "1.6",
    backgroundColor: "#eff6ff",
    border: "1px solid #dbeafe",
    padding: "16px",
    borderRadius: "8px",
  };

  const examplesGridStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const exampleCardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: "#ffffff",
    position: "relative",
    overflow: "hidden",
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <div style={overlayStyle} onClick={onClose} aria-hidden="true" />

      <div style={sidebarStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <BookOpen size={24} className="text-blue-600" />
            Example Models
          </h2>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            title="Close sidebar"
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
          <div style={introTextStyle}>
            Explore these ready-to-use Mealy Machine examples from the{" "}
            <strong>Cyber-Physical Systems</strong> textbook. Click any card to
            load it into the editor.
          </div>

          <div style={examplesGridStyle}>
            {exampleMachines.map((machine) => {
              const isHovered = hoveredId === machine.id;
              const cardStyle = {
                ...exampleCardStyle,
                borderColor: isHovered ? "#3b82f6" : "#e5e7eb",
                boxShadow: isHovered
                  ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transform: isHovered ? "translateY(-2px)" : "none",
              };

              return (
                <div
                  key={machine.id}
                  style={cardStyle}
                  onClick={() => handleLoadExample(machine)}
                  onMouseEnter={() => setHoveredId(machine.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: isHovered ? "#2563eb" : "#111827",
                        transition: "color 0.2s",
                      }}
                    >
                      {machine.name}
                    </h3>
                    <ChevronRight
                      size={20}
                      style={{
                        color: isHovered ? "#3b82f6" : "#9ca3af",
                        transform: isHovered ? "translateX(4px)" : "none",
                        transition: "all 0.2s",
                      }}
                    />
                  </div>

                  <p
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "0.95rem",
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    {machine.description}
                  </p>

                  <div style={{ display: "flex", gap: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      <Layers size={16} />
                      <span>{machine.states.length} States</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      <ArrowRightLeft size={16} />
                      <span>{machine.transitions.length} Transitions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamplesSidebar;
