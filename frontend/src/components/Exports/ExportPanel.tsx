import React, { useState } from "react";
import { StateMachine } from "../../models/types";
import { apiService } from "../../services/apiService";
import {
  pdfExportService,
  VerificationData,
  ExportOptions,
  SimulationData,
  TestCaseData,
} from "../../services/PDFExportService";
import {
  Download,
  FileJson,
  FileText,
  Image as ImageIcon,
  Table2,
  ArrowRightLeft,
  ShieldCheck,
  FlaskConical,
  PlayCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ExportPanelProps {
  stateMachine: StateMachine;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ stateMachine }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeDiagram: true,
    includeStateTable: true,
    includeTransitions: true,
    includeVerification: true,
    includeTestCases: true,
    includeSimulation: false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    setExportStatus("Preparing data...");
    setError("");

    try {
      const exportData: {
        verification?: VerificationData;
        simulation?: SimulationData;
        testCases?: TestCaseData[];
      } = {};

      if (exportOptions.includeVerification) {
        setExportStatus("Running verification...");
        const verResult = await apiService.verifyMachine(stateMachine);
        exportData.verification = {
          isValid: verResult.isValid,
          reachableStates: verResult.reachableStates,
          totalStates: verResult.totalStates,
          errors: verResult.errors,
          warnings: verResult.warnings,
          deadlocks: verResult.deadlocks,
          summary: verResult.summary,
        };
      }

      if (exportOptions.includeTestCases) {
        // Placeholder for actual test generation if available
        exportData.testCases = [];
      }

      setExportStatus("Generating PDF report...");
      await new Promise((resolve) => setTimeout(resolve, 100));

      await pdfExportService.export(stateMachine, exportOptions, exportData);

      setExportStatus("Success");
      setTimeout(() => setExportStatus(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = (): void => {
    const jsonData = JSON.stringify(stateMachine, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stateMachine.name.replace(/\s+/g, "_")}_FSM.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleOption = (key: keyof ExportOptions) => {
    if (!isExporting) {
      setExportOptions({ ...exportOptions, [key]: !exportOptions[key] });
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

  const optionsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  };

  const optionCardStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
    cursor: isExporting ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    opacity: isExporting ? 0.7 : 1,
  });

  const optionLabelStyle = (isSelected: boolean): React.CSSProperties => ({
    fontSize: "0.875rem",
    fontWeight: "500",
    color: isSelected ? "#1e40af" : "#374151",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  const mainButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: isExporting ? "not-allowed" : "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
    opacity: isExporting ? 0.7 : 1,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...mainButtonStyle,
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
  };

  const statusStyle = (
    isError: boolean,
    isSuccess: boolean,
  ): React.CSSProperties => ({
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "0.875rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: isError ? "#fef2f2" : isSuccess ? "#ecfdf5" : "#eff6ff",
    color: isError ? "#991b1b" : isSuccess ? "#065f46" : "#1e40af",
    border: `1px solid ${
      isError ? "#fee2e2" : isSuccess ? "#d1fae5" : "#dbeafe"
    }`,
  });

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <FileText size={18} className="text-blue-600" />
        Export Report
      </div>

      <div style={contentStyle}>
        {(exportStatus || error) && (
          <div style={statusStyle(!!error, exportStatus === "Success")}>
            {error ? (
              <AlertTriangle size={18} />
            ) : exportStatus === "Success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <Loader2 size={18} className="animate-spin" />
            )}
            {error || exportStatus}
          </div>
        )}

        <div>
          <div style={sectionTitleStyle}>Report Contents</div>
          <div style={optionsGridStyle}>
            <div
              style={optionCardStyle(exportOptions.includeDiagram)}
              onClick={() => toggleOption("includeDiagram")}
            >
              <div style={optionLabelStyle(exportOptions.includeDiagram)}>
                <ImageIcon
                  size={18}
                  className={
                    exportOptions.includeDiagram
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                Diagram
              </div>
            </div>
            <div
              style={optionCardStyle(exportOptions.includeStateTable)}
              onClick={() => toggleOption("includeStateTable")}
            >
              <div style={optionLabelStyle(exportOptions.includeStateTable)}>
                <Table2
                  size={18}
                  className={
                    exportOptions.includeStateTable
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                States
              </div>
            </div>
            <div
              style={optionCardStyle(exportOptions.includeTransitions)}
              onClick={() => toggleOption("includeTransitions")}
            >
              <div style={optionLabelStyle(exportOptions.includeTransitions)}>
                <ArrowRightLeft
                  size={18}
                  className={
                    exportOptions.includeTransitions
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                Transitions
              </div>
            </div>
            <div
              style={optionCardStyle(exportOptions.includeVerification)}
              onClick={() => toggleOption("includeVerification")}
            >
              <div style={optionLabelStyle(exportOptions.includeVerification)}>
                <ShieldCheck
                  size={18}
                  className={
                    exportOptions.includeVerification
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                Verification
              </div>
            </div>
            <div
              style={optionCardStyle(exportOptions.includeTestCases)}
              onClick={() => toggleOption("includeTestCases")}
            >
              <div style={optionLabelStyle(exportOptions.includeTestCases)}>
                <FlaskConical
                  size={18}
                  className={
                    exportOptions.includeTestCases
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                Test Cases
              </div>
            </div>
            <div
              style={optionCardStyle(exportOptions.includeSimulation)}
              onClick={() => toggleOption("includeSimulation")}
            >
              <div style={optionLabelStyle(exportOptions.includeSimulation)}>
                <PlayCircle
                  size={18}
                  className={
                    exportOptions.includeSimulation
                      ? "text-blue-600"
                      : "text-gray-400"
                  }
                />
                Simulation
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={mainButtonStyle}
          >
            {isExporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isExporting ? "Generating PDF..." : "Download PDF Report"}
          </button>
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            style={secondaryButtonStyle}
          >
            <FileJson size={18} className="text-gray-500" />
            Export Raw JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
