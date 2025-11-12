import React, { useEffect, useState } from "react";
import { StateMachine } from "../../models/types";
import { apiService } from "../../services/apiService";
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Loader2,
  Activity,
  RefreshCw,
} from "lucide-react";

interface SimulatorProps {
  stateMachine: StateMachine;
  initialInputs?: string[];
}

interface SimulationResult {
  isValid: boolean;
  initialState: string;
  finalState: string;
  steps: any[];
  totalSteps: number;
}

const Simulator: React.FC<SimulatorProps> = ({
  stateMachine,
  initialInputs,
}) => {
  const [inputSequence, setInputSequence] = useState<string>("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    if (initialInputs && initialInputs.length > 0) {
      setInputSequence(initialInputs.join(" "));
      runSimulation(initialInputs);
    }
  }, [initialInputs]);

  const runSimulation = async (inputs: string[]) => {
    setIsLoading(true);
    setResult(null);
    setErrors([]);

    try {
      const res = await apiService.simulateMachine(stateMachine, inputs);
      if (!res.isValid) {
        setErrors(["Simulation failed: Invalid transition found"]);
      }
      setResult(res);
    } catch (e) {
      setErrors([`Simulation error: ${e}`]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRunSimulation = async (): Promise<void> => {
    setErrors([]);
    setResult(null);

    if (apiStatus !== "connected") {
      setErrors(["API Server not connected. Cannot run simulation."]);
      return;
    }

    const inputs = inputSequence
      .split(/\s+/)
      .filter((s) => s.trim().length > 0);

    if (inputs.length === 0) {
      setErrors(["Please enter an input sequence."]);
      return;
    }

    runSimulation(inputs);
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
    gap: "20px",
  };

  const statusBannerStyle = (
    status: "checking" | "connected" | "disconnected",
  ): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor:
      status === "connected"
        ? "#ecfdf5"
        : status === "disconnected"
        ? "#fef2f2"
        : "#f9fafb",
    color:
      status === "connected"
        ? "#065f46"
        : status === "disconnected"
        ? "#991b1b"
        : "#374151",
    border: `1px solid ${
      status === "connected"
        ? "#d1fae5"
        : status === "disconnected"
        ? "#fee2e2"
        : "#e5e7eb"
    }`,
  });

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    minHeight: "100px",
    fontFamily: "monospace",
    fontSize: "0.9rem",
    resize: "vertical",
    marginBottom: "12px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const mainButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: isLoading || apiStatus !== "connected" ? "not-allowed" : "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
    opacity: isLoading || apiStatus !== "connected" ? 0.7 : 1,
  };

  const errorBoxStyle: React.CSSProperties = {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    fontSize: "0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const resultBoxStyle = (isValid: boolean): React.CSSProperties => ({
    borderRadius: "8px",
    border: `1px solid ${isValid ? "#d1fae5" : "#fee2e2"}`,
    overflow: "hidden",
  });

  const resultHeaderStyle = (isValid: boolean): React.CSSProperties => ({
    padding: "12px 16px",
    backgroundColor: isValid ? "#ecfdf5" : "#fef2f2",
    color: isValid ? "#065f46" : "#991b1b",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: `1px solid ${isValid ? "#d1fae5" : "#fee2e2"}`,
  });

  const resultStatsStyle: React.CSSProperties = {
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    fontSize: "0.875rem",
    color: "#374151",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #f3f4f6",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 16px",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    fontWeight: "600",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    borderBottom: "1px solid #e5e7eb",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderBottom: "1px solid #f3f4f6",
    color: "#111827",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <Activity size={18} className="text-blue-600" />
        Simulator
      </div>

      <div style={contentStyle}>
        {/* API Status Banner */}
        <div style={statusBannerStyle(apiStatus)}>
          {apiStatus === "connected" ? (
            <CheckCircle2 size={18} />
          ) : apiStatus === "disconnected" ? (
            <XCircle size={18} />
          ) : (
            <RefreshCw size={18} className="animate-spin" />
          )}
          <span>
            {apiStatus === "connected"
              ? "Backend Connected"
              : apiStatus === "disconnected"
              ? "Backend Disconnected"
              : "Connecting..."}
          </span>
        </div>

        {/* Input Area */}
        <div>
          <div
            style={{
              marginBottom: "8px",
              fontWeight: "500",
              color: "#374151",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Terminal size={16} /> Input Sequence
          </div>
          <textarea
            value={inputSequence}
            onChange={(e) => setInputSequence(e.target.value)}
            placeholder="e.g., coin coin press"
            style={textareaStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
          />
          <button
            onClick={handleRunSimulation}
            disabled={isLoading || apiStatus !== "connected"}
            style={mainButtonStyle}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            {isLoading ? "Simulating..." : "Run Simulation"}
          </button>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={errorBoxStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
              }}
            >
              <AlertTriangle size={18} /> Error
            </div>
            <ul style={{ margin: 0, paddingLeft: "24px" }}>
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={resultBoxStyle(result.isValid)}>
            <div style={resultHeaderStyle(result.isValid)}>
              {result.isValid ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}
              {result.isValid ? "Simulation Successful" : "Simulation Failed"}
            </div>
            <div style={resultStatsStyle}>
              <div>
                <strong>Start:</strong> {result.initialState}
              </div>
              <div>
                <strong>End:</strong> {result.finalState}
              </div>
              <div>
                <strong>Steps:</strong> {result.totalSteps}
              </div>
            </div>

            {result.steps.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Input</th>
                      <th style={thStyle}>State Transition</th>
                      <th style={thStyle}>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((step, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                        }}
                      >
                        <td style={{ ...tdStyle, color: "#6b7280" }}>
                          {step.step}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontFamily: "monospace",
                            fontWeight: "600",
                          }}
                        >
                          {step.input}
                        </td>
                        <td style={tdStyle}>
                          {step.currentState}{" "}
                          <span style={{ color: "#9ca3af" }}>→</span>{" "}
                          {step.nextState}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            color: step.output ? "#059669" : "#9ca3af",
                          }}
                        >
                          {step.output || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;
