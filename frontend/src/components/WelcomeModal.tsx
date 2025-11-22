import React, { useState, useEffect } from "react";
import { Info, CheckCircle2, Github } from "lucide-react";

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
    // setIsOpen(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    width: "90%",
    maxWidth: "600px",
    overflow: "hidden",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 24px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#111827",
  };

  const contentStyle: React.CSSProperties = {
    padding: "24px",
    color: "#374151",
    fontSize: "1rem",
    lineHeight: "1.6",
  };

  const footerStyle: React.CSSProperties = {
    padding: "16px 24px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 4,
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <Info size={28} className="text-blue-600" />
          <h2 style={titleStyle}>Welcome to FSM Modeler</h2>
        </div>
        <div style={contentStyle}>
          <p style={{ marginTop: 0 }}>
            This project presents the design and implementation of a custom
            Finite State Machine (FSM) modeler in C++. The system features an
            interactive interface for building FSMs, an automated test
            generation module based on the Breadth-First Search (BFS) algorithm,
            and an integrated engine for simulation and formal verification.
          </p>
          <p>
            Results, including state diagrams, simulation traces, and
            verification reports, are automatically exported in LaTeX-compatible
            format to enable seamless integration into academic documentation
            and reports.
          </p>
          <p>
            The tool is targeted for academic research, teaching, and rapid
            prototyping of reactive systems and cyber-physical system
            controllers.
          </p>

          <div
            style={{
              marginTop: "20px",
              padding: "10px 14px",
              borderLeft: "4px solid #2563eb",
              backgroundColor: "#f3f4f6",
              borderRadius: "6px",
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            Developed by Aman Kumar
          </div>
        </div>
        <div style={footerStyle}>
          <button
            onClick={handleClose}
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1d4ed8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
          >
            <CheckCircle2 size={18} /> I understand
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              window.open(
                "https://github.com/AMAN081118/reactive-system-modeler",
                "_blank",
              );
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1c1d21ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#17181bff")
            }
          >
            <Github size={18} /> Github
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
