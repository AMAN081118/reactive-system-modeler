import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { StorageService, StoredMachine } from "../../services/storageService";
import {
  Save,
  FolderOpen,
  PlusCircle,
  Trash2,
  Download,
  Upload,
  FileJson,
  HardDrive,
  Clock,
} from "lucide-react";

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
  const [importMode, setImportMode] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>("");

  const handleSaveMachine = () => {
    const machine = { ...currentMachine, name: machineNameInput };
    StorageService.saveMachine(machine);
    setSavedMachines(StorageService.getAllMachines());
    // I might want to replace pure alerts with a nicer toast notification system later
    alert(`Machine "${machineNameInput}" saved successfully.`);
  };

  const handleLoadMachine = (id: string) => {
    if (
      window.confirm(
        "Load this machine? Unsaved changes to current machine will be lost.",
      )
    ) {
      const machine = StorageService.loadMachine(id);
      if (machine) {
        onLoadMachine(machine);
        setMachineNameInput(machine.name);
      }
    }
  };

  const handleDeleteMachine = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this saved machine permanently?",
      )
    ) {
      StorageService.deleteMachine(id);
      setSavedMachines(StorageService.getAllMachines());
    }
  };

  const handleExportJson = () => {
    const json = StorageService.exportAsJSON(currentMachine);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentMachine.name.replace(
      /\s+/g,
      "_",
    )}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    try {
      const machine = StorageService.importFromJSON(jsonInput);
      onLoadMachine(machine);
      setMachineNameInput(machine.name);
      setJsonInput("");
      setImportMode(false);
      alert("Machine imported successfully!");
    } catch (error) {
      alert(`Invalid JSON: ${error}`);
    }
  };

  // --- Styles ---
  const panelStyle: React.CSSProperties = {
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

  const contentStyle: React.CSSProperties = {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
  };

  const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
  };

  const savedListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "300px",
    overflowY: "auto",
  };

  const savedItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const iconActionButtonStyle = (color: string): React.CSSProperties => ({
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

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    marginBottom: "12px",
    resize: "vertical",
    boxSizing: "border-box",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <HardDrive size={18} className="text-blue-600" />
        Save & Load
      </div>

      <div style={contentStyle}>
        {/* --- Current Machine Operations --- */}
        <div>
          <div style={sectionTitleStyle}>Current Workspace</div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div style={inputGroupStyle}>
              <input
                type="text"
                value={machineNameInput}
                onChange={(e) => setMachineNameInput(e.target.value)}
                style={inputStyle}
                placeholder="Machine Name"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
              <button
                onClick={handleSaveMachine}
                style={primaryButtonStyle}
                title="Save to browser storage"
              >
                <Save size={16} /> Save
              </button>
            </div>
            <button
              onClick={() =>
                window.confirm("Discard all changes and start new?") &&
                onNewMachine()
              }
              style={secondaryButtonStyle}
            >
              <PlusCircle size={16} className="text-green-600" /> Create New
              Machine
            </button>
          </div>
        </div>

        {/* --- Saved Machines List --- */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "200px",
          }}
        >
          <div style={sectionTitleStyle}>
            Local Saves ({savedMachines.length})
          </div>
          {savedMachines.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                border: "2px dashed #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <Save size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                No machines saved locally yet.
              </p>
            </div>
          ) : (
            <div style={savedListStyle}>
              {savedMachines.map((machine) => (
                <div
                  key={machine.id}
                  style={savedItemStyle}
                  onClick={() => handleLoadMachine(machine.id)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#3b82f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                >
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {machine.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={12} />{" "}
                      {new Date(machine.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadMachine(machine.id);
                      }}
                      style={iconActionButtonStyle("#2563eb")}
                      title="Load this machine"
                    >
                      <FolderOpen size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMachine(machine.id, e)}
                      style={iconActionButtonStyle("#dc2626")}
                      title="Delete permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Import / Export --- */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={sectionTitleStyle}>External Files</div>
          {!importMode ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button onClick={handleExportJson} style={secondaryButtonStyle}>
                <Download size={16} /> Export JSON
              </button>
              <button
                onClick={() => setImportMode(true)}
                style={secondaryButtonStyle}
              >
                <Upload size={16} /> Import JSON
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileJson size={16} className="text-blue-600" /> Paste Machine
                JSON
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "id": "...", "states": [...] }'
                style={textareaStyle}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleImportJson}
                  style={{ ...primaryButtonStyle, flex: 1 }}
                >
                  Import Now
                </button>
                <button
                  onClick={() => setImportMode(false)}
                  style={{ ...secondaryButtonStyle, flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadPanel;
