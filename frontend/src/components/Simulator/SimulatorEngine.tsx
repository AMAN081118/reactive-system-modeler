import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { apiService } from "../../services/apiService";

interface SimulatorProps {
  stateMachine: StateMachine;
}

interface SimulationResult {
  isValid: boolean;
  initialState: string;
  finalState: string;
  steps: any[];
  totalSteps: number;
}

const Simulator: React.FC<SimulatorProps> = ({ stateMachine }) => {
  const [inputSequence, setInputSequence] = useState<string>("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  // Check API connection on mount
  React.useEffect(() => {
    const checkApi = async (): Promise<void> => {
      try {
        await apiService.checkHealth();
        setApiStatus("connected");
      } catch {
        setApiStatus("disconnected");
      }
    };
    checkApi();
  }, []);

  // FIXED: Return type should be Promise<void>, not void
  const handleRunSimulation = async (): Promise<void> => {
    setErrors([]);
    setResult(null);

    if (apiStatus !== "connected") {
      setErrors(["API Server not connected. Running local simulation..."]);
      return;
    }

    const inputs = inputSequence
      .split(/\s+/)
      .filter((s) => s.trim().length > 0);

    if (inputs.length === 0) {
      setErrors(["Please enter input sequence"]);
      return;
    }

    setIsLoading(true);

    try {
      const simulationResult = await apiService.simulateMachine(
        stateMachine,
        inputs,
      );
      setResult(simulationResult);

      if (!simulationResult.isValid) {
        setErrors(["Simulation failed: Invalid transition found"]);
      }
    } catch (error) {
      setErrors([`Simulation error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Return type should be Promise<void>, not void
  const handleValidate = async (): Promise<void> => {
    if (apiStatus !== "connected") {
      setErrors(["API Server not connected"]);
      return;
    }

    setIsLoading(true);
    try {
      const validation = await apiService.validateMachine(stateMachine);
      if (!validation.valid) {
        setErrors(validation.errors);
      } else {
        setErrors([]);
        alert("✓ State machine is valid!");
      }
    } catch (error) {
      setErrors([`Validation error: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  };

  const statusStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px",
    fontSize: "0.9em",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const statusConnected: React.CSSProperties = {
    ...statusStyle,
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
  };

  const statusDisconnected: React.CSSProperties = {
    ...statusStyle,
    backgroundColor: "#ffebee",
    color: "#b71c1c",
  };

  return (
    <div style={containerStyle}>
      <h3>State Machine Simulator</h3>

      {/* API Status */}
      <div
        style={
          apiStatus === "connected"
            ? statusConnected
            : apiStatus === "disconnected"
            ? statusDisconnected
            : statusStyle
        }
      >
        <span>
          {apiStatus === "connected"
            ? "🟢"
            : apiStatus === "disconnected"
            ? "🔴"
            : "🟡"}
        </span>
        <span>
          {apiStatus === "connected"
            ? "Connected to backend"
            : apiStatus === "disconnected"
            ? "Backend disconnected - using local simulation"
            : "Checking connection..."}
        </span>
      </div>

      {/* Input Area */}
      <div style={{ marginBottom: "15px" }}>
        <textarea
          value={inputSequence}
          onChange={(e) => setInputSequence(e.target.value)}
          placeholder="Enter input sequence (space-separated)"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            minHeight: "80px",
            fontFamily: "monospace",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleRunSimulation}
            disabled={isLoading || apiStatus === "disconnected"}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                isLoading || apiStatus === "disconnected"
                  ? "not-allowed"
                  : "pointer",
              opacity: isLoading || apiStatus === "disconnected" ? 0.6 : 1,
            }}
          >
            {isLoading ? "Running..." : "Run Simulation"}
          </button>
          <button
            onClick={handleValidate}
            disabled={isLoading || apiStatus === "disconnected"}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                isLoading || apiStatus === "disconnected"
                  ? "not-allowed"
                  : "pointer",
              opacity: isLoading || apiStatus === "disconnected" ? 0.6 : 1,
            }}
          >
            {isLoading ? "Validating..." : "Validate"}
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#b71c1c",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "15px",
            borderLeft: "4px solid #b71c1c",
          }}
        >
          {errors.map((err, idx) => (
            <div
              key={idx}
              style={{ marginBottom: idx < errors.length - 1 ? "8px" : 0 }}
            >
              • {err}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          style={{
            backgroundColor: result.isValid ? "#e8f5e9" : "#ffebee",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "15px",
            borderLeft: `4px solid ${result.isValid ? "#1b5e20" : "#b71c1c"}`,
          }}
        >
          <strong style={{ fontSize: "1.1em" }}>
            {result.isValid ? "✓ Simulation Successful" : "✗ Simulation Failed"}
          </strong>
          <div style={{ marginTop: "10px", fontSize: "0.9em" }}>
            Initial: <strong>{result.initialState}</strong> → Final:{" "}
            <strong>{result.finalState}</strong>
          </div>
          <div>Steps: {result.totalSteps}</div>

          {/* Steps table */}
          {result.steps.length > 0 && (
            <table
              style={{
                width: "100%",
                marginTop: "15px",
                borderCollapse: "collapse",
                fontSize: "0.85em",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Step
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Input
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    State
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Output
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.steps.map((step, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                    }}
                  >
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {step.step}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      <strong>{step.input}</strong>
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {step.currentState} → {step.nextState}
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {step.output || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Simulator;
