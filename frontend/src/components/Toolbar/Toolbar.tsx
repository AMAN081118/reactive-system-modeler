import React, { useState } from "react";

interface ToolbarProps {
  onAddState: (stateName: string, isInitial: boolean) => void;
  onDeleteSelected: () => void;
  onToggleTransitionMode: (mode: boolean) => void;
  isTransitionMode: boolean;
  stateMachineCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddState,
  onDeleteSelected,
  onToggleTransitionMode,
  isTransitionMode,
  stateMachineCount,
}) => {
  const [newStateName, setNewStateName] = useState<string>("");
  const [isInitial, setIsInitial] = useState<boolean>(false);

  const handleAddState = (): void => {
    if (newStateName.trim()) {
      onAddState(newStateName.trim(), isInitial);
      setNewStateName("");
      setIsInitial(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleAddState();
    }
  };

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    flexWrap: "wrap",
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#f44336",
  };

  const transitionButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: isTransitionMode ? "#4caf50" : "#ff9800",
  };

  const checkboxStyle: React.CSSProperties = {
    cursor: "pointer",
  };

  return (
    <div style={toolbarStyle}>
      <span style={{ fontWeight: "bold" }}>States: {stateMachineCount}</span>

      {/* State Creation */}
      <input
        type="text"
        placeholder="Enter state name"
        value={newStateName}
        onChange={(e) => setNewStateName(e.target.value)}
        onKeyPress={handleKeyPress}
        style={inputStyle}
      />
      <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <input
          type="checkbox"
          checked={isInitial}
          onChange={(e) => setIsInitial(e.target.checked)}
          style={checkboxStyle}
        />
        Initial
      </label>
      <button onClick={handleAddState} style={buttonStyle}>
        Add State
      </button>

      {/* Separator */}
      <div style={{ width: "1px", height: "24px", backgroundColor: "#ddd" }} />

      {/* Transition Mode */}
      <button
        onClick={() => onToggleTransitionMode(!isTransitionMode)}
        style={transitionButtonStyle}
        title="Click: source → target (same state = self-loop)"
      >
        {isTransitionMode ? "✓ Transition Mode" : "Add Transition"}
      </button>

      {/* Delete */}
      <button onClick={onDeleteSelected} style={deleteButtonStyle}>
        Delete (Del)
      </button>

      {/* Help Text */}
      {isTransitionMode && (
        <span style={{ fontSize: "0.85em", color: "#666", marginLeft: "10px" }}>
          💡 Click source state, then target state (click same state twice for
          self-loop)
        </span>
      )}
    </div>
  );
};

export default Toolbar;
