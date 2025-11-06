import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { StorageService, StoredMachine } from "../../services/storageService";

interface SaveLoadPanelProps {
  currentMachine: StateMachine;
  onLoadMachine: (machine: StateMachine) => void;
  onNewMachine: () => void;
}

const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  currentMachine,
  onLoadMachine,
  onNewMachine,
}) => {
  const [savedMachines, setSavedMachines] = useState<StoredMachine[]>(
    StorageService.getAllMachines(),
  );
  const [machineNameInput, setMachineNameInput] = useState<string>(
    currentMachine.name,
  );
  const [exportJsonOpen, setExportJsonOpen] = useState<boolean>(false);
  const [importJsonOpen, setImportJsonOpen] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>("");

  // Save current machine
  const handleSaveMachine = (): void => {
    const machine = { ...currentMachine, name: machineNameInput };
    StorageService.saveMachine(machine);
    setSavedMachines(StorageService.getAllMachines());
    alert(`Machine "${machineNameInput}" saved!`);
  };

  // Load machine
  const handleLoadMachine = (id: string): void => {
    const machine = StorageService.loadMachine(id);
    if (machine) {
      onLoadMachine(machine);
      setSavedMachines(StorageService.getAllMachines());
    }
  };

  // Delete machine
  const handleDeleteMachine = (id: string): void => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      StorageService.deleteMachine(id);
      setSavedMachines(StorageService.getAllMachines());
    }
  };

  // Export as JSON
  const handleExportJson = (): void => {
    const json = StorageService.exportAsJSON(currentMachine);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentMachine.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from JSON
  const handleImportJson = (): void => {
    try {
      const machine = StorageService.importFromJSON(jsonInput);
      onLoadMachine(machine);
      setJsonInput("");
      setImportJsonOpen(false);
      alert("Machine imported successfully!");
    } catch (error) {
      alert(`Import error: ${error}`);
    }
  };

  const panelStyle: React.CSSProperties = {
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginBottom: "15px",
    maxHeight: "500px",
    overflowY: "auto",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #ddd",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9em",
    marginRight: "8px",
    marginBottom: "8px",
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#f44336",
  };

  const listItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9em",
    marginBottom: "10px",
    boxSizing: "border-box",
  };

  return (
    <div style={panelStyle}>
      <h4 style={{ marginTop: 0 }}>Save & Load</h4>

      {/* Current Machine Section */}
      <div style={sectionStyle}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}
        >
          Machine Name
        </label>
        <input
          type="text"
          value={machineNameInput}
          onChange={(e) => setMachineNameInput(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleSaveMachine} style={buttonStyle}>
          💾 Save Machine
        </button>
        <button
          onClick={onNewMachine}
          style={{ ...buttonStyle, backgroundColor: "#ff9800" }}
        >
          📄 New Machine
        </button>
      </div>

      {/* Saved Machines */}
      <div style={sectionStyle}>
        <h5 style={{ marginTop: 0 }}>
          Saved Machines ({savedMachines.length})
        </h5>
        {savedMachines.length === 0 ? (
          <p style={{ color: "#999", fontSize: "0.9em" }}>
            No saved machines yet
          </p>
        ) : (
          savedMachines.map((machine) => (
            <div key={machine.id} style={listItemStyle}>
              <div>
                <strong>{machine.name}</strong>
                <div style={{ fontSize: "0.8em", color: "#999" }}>
                  {new Date(machine.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleLoadMachine(machine.id)}
                  style={{ ...buttonStyle, marginRight: "4px" }}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDeleteMachine(machine.id)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import/Export Section */}
      <div>
        <button
          onClick={handleExportJson}
          style={{ ...buttonStyle, backgroundColor: "#4caf50" }}
        >
          📤 Export JSON
        </button>
        <button
          onClick={() => setImportJsonOpen(!importJsonOpen)}
          style={{ ...buttonStyle, backgroundColor: "#4caf50" }}
        >
          📥 Import JSON
        </button>

        {importJsonOpen && (
          <div style={{ marginTop: "10px" }}>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON here..."
              style={{
                ...inputStyle,
                minHeight: "150px",
                fontFamily: "monospace",
                fontSize: "0.8em",
              }}
            />
            <button
              onClick={handleImportJson}
              style={{ ...buttonStyle, backgroundColor: "#4caf50" }}
            >
              Import
            </button>
            <button
              onClick={() => setImportJsonOpen(false)}
              style={{ ...buttonStyle, backgroundColor: "#999" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveLoadPanel;
