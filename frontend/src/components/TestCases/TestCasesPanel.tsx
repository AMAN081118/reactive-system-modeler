import React, { useEffect, useState } from "react";
// Import TestCase from the shared types file
import { StateMachine, TestCase } from "../../models/types";
import { apiService } from "../../services/apiService";
import Simulator from "../Simulator/SimulatorEngine";
import {
  FlaskConical,
  Play,
  AlertTriangle,
  Loader2,
  PlayCircle,
} from "lucide-react";

interface TestCasesPanelProps {
  stateMachine: StateMachine;
  onTestCasesGenerated: (testCases: TestCase[]) => void; // <-- NEW PROP
}

const TestCasesPanel: React.FC<TestCasesPanelProps> = ({
  stateMachine,
  onTestCasesGenerated, // <-- NEW PROP
}) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);

  useEffect(() => {
    if (stateMachine.states.length === 0) {
      onTestCasesGenerated([]); // Clear test cases if no states
      return;
    }
    setLoading(true);
    apiService
      .generateTests(stateMachine)
      .then((res: { testCases: any[]; count: number }) => {
        const newTestCases = res.testCases as TestCase[];
        setTestCases(newTestCases);
        onTestCasesGenerated(newTestCases); // <-- SEND DATA TO PARENT
        setLoading(false);
        setError(null);
      })
      .catch((err: any) => {
        setError(`Failed to generate test cases. Is the backend running?`);
        console.error(err);
        setLoading(false);
        onTestCasesGenerated([]); // Clear test cases on error
      });
  }, [stateMachine, onTestCasesGenerated]); // Added prop to dependency array

  // ... (All styles remain the same)
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
  };
  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };
  const itemStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: "16px",
    borderRadius: "8px",
    border: `1px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });
  const testNameStyle: React.CSSProperties = {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };
  const detailRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    fontSize: "0.875rem",
    color: "#4b5563",
    marginTop: "4px",
  };
  const labelStyle: React.CSSProperties = {
    fontWeight: "600",
    color: "#6b7280",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    minWidth: "70px",
  };
  const runButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    border: "none",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <FlaskConical size={18} className="text-blue-600" />
        Generated Test Cases
      </div>

      <div style={contentStyle}>
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6b7280",
              padding: "20px",
              justifyContent: "center",
            }}
          >
            <Loader2 size={20} className="animate-spin text-blue-600" />
            Generating optimal test paths...
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fee2e2",
              color: "#991b1b",
              fontSize: "0.9rem",
            }}
          >
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && testCases.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
            }}
          >
            No test cases could be generated. Ensure your state machine has
            reachable states and transitions.
          </div>
        )}

        {!loading && testCases.length > 0 && (
          <ul style={listStyle}>
            {testCases.map((test) => (
              <li
                key={test.id}
                style={itemStyle(selectedTest?.id === test.id)}
                onClick={() => setSelectedTest(test)}
              >
                <div style={testNameStyle}>
                  {test.name}
                  {selectedTest?.id !== test.id && (
                    <button style={runButtonStyle}>
                      <Play size={12} fill="currentColor" /> Run
                    </button>
                  )}
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Inputs</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#f3f4f6",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    [{test.inputs.join(", ")}]
                  </span>
                </div>
                <div style={detailRowStyle}>
                  <span style={labelStyle}>Expects</span>
                  <span style={{ fontWeight: "500" }}>
                    {test.expectedFinalState}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {selectedTest && (
          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                fontSize: "1rem",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <PlayCircle size={18} className="text-green-600" />
              Executing: {selectedTest.name}
            </h4>
            <Simulator
              stateMachine={stateMachine}
              initialInputs={selectedTest.inputs}
              key={selectedTest.id} // Force re-mount on new test selection
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasesPanel;
