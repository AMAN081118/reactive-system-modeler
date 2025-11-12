import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { apiService } from "../../services/apiService";
import {
  ShieldCheck,
  Play,
  AlertTriangle,
  XCircle,
  Ban,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";

interface VerificationPanelProps {
  stateMachine: StateMachine;
}

interface VerificationResult {
  isValid: boolean;
  reachableStates: number;
  totalStates: number;
  errors: string[];
  warnings: string[];
  deadlocks: string[];
  summary: string;
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  stateMachine,
}) => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleVerify = async (): Promise<void> => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const verificationResult = await apiService.verifyMachine(stateMachine);
      setResult(verificationResult);
    } catch (err) {
      setError(`Verification failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  const mainButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: isLoading ? "not-allowed" : "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
    opacity: isLoading ? 0.7 : 1,
  };

  const statusBannerStyle = (isValid: boolean): React.CSSProperties => ({
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: isValid ? "#ecfdf5" : "#fef2f2",
    border: `1px solid ${isValid ? "#d1fae5" : "#fee2e2"}`,
    color: isValid ? "#065f46" : "#991b1b",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  });

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const listStyle: React.CSSProperties = {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "0.875rem",
    color: "#4b5563",
    lineHeight: "1.5",
  };

  const summaryBoxStyle: React.CSSProperties = {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    color: "#1f2937",
    lineHeight: "1.5",
    border: "1px solid #e5e7eb",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <ShieldCheck size={18} className="text-blue-600" />
        Model Verification
      </div>

      <div style={contentStyle}>
        <div>
          <p
            style={{
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "0.9rem",
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >
            Run a formal verification check to identify deadlocks, unreachable
            states, and nondeterministic transitions in your model.
          </p>
          <button
            onClick={handleVerify}
            disabled={isLoading}
            style={mainButtonStyle}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            {isLoading ? "Verifying Model..." : "Run Verification"}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              fontSize: "0.9rem",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {result && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Main Status Banner */}
            <div style={statusBannerStyle(result.isValid)}>
              {result.isValid ? (
                <CheckCircle2
                  size={24}
                  className="text-green-600 flex-shrink-0"
                />
              ) : (
                <XCircle size={24} className="text-red-600 flex-shrink-0" />
              )}
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "1rem",
                    marginBottom: "4px",
                  }}
                >
                  {result.isValid ? "Model is Valid" : "Issues Detected"}
                </div>
                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                  {result.isValid
                    ? "No structural issues found."
                    : "The model contains errors that may affect execution."}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div style={sectionTitleStyle}>
                <Info size={16} /> Analysis Summary
              </div>
              <div style={summaryBoxStyle}>
                {result.summary}
                <div style={{ marginTop: "8px", fontWeight: "500" }}>
                  Coverage: {result.reachableStates} / {result.totalStates}{" "}
                  states reachable.
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <div style={{ ...sectionTitleStyle, color: "#dc2626" }}>
                  <XCircle size={16} /> Critical Errors ({result.errors.length})
                </div>
                <ul style={listStyle}>
                  {result.errors.map((err, idx) => (
                    <li key={idx} style={{ marginBottom: "4px" }}>
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadlocks */}
            {result.deadlocks.length > 0 && (
              <div>
                <div style={{ ...sectionTitleStyle, color: "#dc2626" }}>
                  <Ban size={16} /> Deadlocks ({result.deadlocks.length})
                </div>
                <ul style={listStyle}>
                  {result.deadlocks.map((deadlock, idx) => (
                    <li key={idx} style={{ marginBottom: "4px" }}>
                      State <strong>{deadlock}</strong> has no outgoing
                      transitions.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div>
                <div style={{ ...sectionTitleStyle, color: "#d97706" }}>
                  <AlertTriangle size={16} /> Warnings ({result.warnings.length}
                  )
                </div>
                <ul style={listStyle}>
                  {result.warnings.map((warn, idx) => (
                    <li key={idx} style={{ marginBottom: "4px" }}>
                      {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPanel;
