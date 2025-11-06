import React, { useState } from "react";
import { State, Transition } from "../../models/types";

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
    width: "300px",
    backgroundColor: "#f9f9f9",
    borderLeft: "1px solid #ddd",
    padding: "15px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 100px)",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #ddd",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "0.9em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9em",
    boxSizing: "border-box",
    marginBottom: "10px",
  };

  if (!selectedState && !selectedTransition) {
    return (
      <div style={panelStyle}>
        <p style={{ color: "#999", textAlign: "center" }}>
          Select a state or transition to view properties
        </p>
      </div>
    );
  }

  if (selectedState) {
    return (
      <div style={panelStyle}>
        <h3>State Properties</h3>
        <div style={sectionStyle}>
          <label style={labelStyle}>State Name</label>
          <input
            type="text"
            value={selectedState.name}
            onChange={(e) =>
              onStateUpdate({
                ...selectedState,
                name: e.target.value,
              })
            }
            style={inputStyle}
          />

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={selectedState.isInitial}
              onChange={(e) =>
                onStateUpdate({
                  ...selectedState,
                  isInitial: e.target.checked,
                })
              }
              style={{ marginRight: "8px" }}
            />
            Initial State
          </label>

          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={selectedState.isFinal}
              onChange={(e) =>
                onStateUpdate({
                  ...selectedState,
                  isFinal: e.target.checked,
                })
              }
              style={{ marginRight: "8px" }}
            />
            Final State
          </label>

          <label style={labelStyle}>Notes</label>
          <textarea
            value={selectedState.notes || ""}
            onChange={(e) =>
              onStateUpdate({
                ...selectedState,
                notes: e.target.value,
              })
            }
            style={{ ...inputStyle, height: "100px", resize: "vertical" }}
          />
        </div>
      </div>
    );
  }

  if (selectedTransition) {
    return (
      <div style={panelStyle}>
        <h3>Transition Properties</h3>
        <div style={sectionStyle}>
          <label style={labelStyle}>Input</label>
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
            placeholder="e.g., event1"
          />

          <label style={labelStyle}>Output</label>
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
            placeholder="e.g., action1"
          />

          <label style={labelStyle}>Guard Condition</label>
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
            placeholder="e.g., x > 0"
          />

          <label style={labelStyle}>Action</label>
          <textarea
            value={selectedTransition.action || ""}
            onChange={(e) =>
              onTransitionUpdate({
                ...selectedTransition,
                action: e.target.value,
              })
            }
            style={{ ...inputStyle, height: "100px", resize: "vertical" }}
            placeholder="e.g., x = x + 1"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default PropertyPanel;
