import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { StateMachine, Transition, State } from "../models/types";

export interface ExportOptions {
  includeDiagram: boolean;
  includeStateTable: boolean;
  includeTransitions: boolean;
  includeVerification: boolean;
  includeTestCases: boolean;
  includeSimulation: boolean;
}

export interface VerificationData {
  isValid: boolean;
  reachableStates: number;
  totalStates: number;
  errors: string[];
  warnings: string[];
  deadlocks: string[];
  summary?: string;
}

export interface SimulationData {
  inputs: string[];
  result: {
    isValid: boolean;
    initialState: string;
    finalState: string;
    steps: Array<{ state: string; input: string; output: string }>;
    totalSteps: number;
  };
}

export interface TestCaseData {
  id: string;
  name: string;
  inputs: string[];
  expectedOutput: string;
  status: "PASS" | "FAIL" | "SKIPPIPPED";
}

class PDFExportService {
  private pdf!: jsPDF;
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly margin = 20;
  private currentY = this.margin;

  private readonly colors = {
    primary: [33, 150, 243] as [number, number, number],
    secondary: [66, 66, 66] as [number, number, number],
    accent: [76, 175, 80] as [number, number, number],
    error: [211, 47, 47] as [number, number, number],
    lightGray: [245, 245, 245] as [number, number, number],
  };

  constructor() {}

  private async captureCanvasScreenshot(): Promise<string | null> {
    // IMPORTANT: Ensure your Canvas component has id="fsm-canvas"
    const element = document.getElementById("fsm-canvas") || document.body;
    if (!element) return null;

    try {
      // Temporarily hide UI controls during capture
      const controls = element.querySelectorAll("button, .controls-container");
      controls.forEach(
        (el) => ((el as HTMLElement).style.visibility = "hidden"),
      );

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2, // Balance quality and file size
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f9f9f9", // Match your canvas background
        logging: false,
      });

      // Restore UI controls
      controls.forEach(
        (el) => ((el as HTMLElement).style.visibility = "visible"),
      );
      return canvas.toDataURL("image/jpeg", 0.9);
    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  }

  // --- PDF Building Blocks ---

  private initializePDF() {
    this.pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    this.currentY = this.margin;
  }

  private checkPageBreak(heightNeeded: number) {
    if (this.currentY + heightNeeded >= this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addSectionHeader(title: string) {
    this.checkPageBreak(25);
    this.currentY += 10;
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(...this.colors.primary);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 2;
    this.pdf.setDrawColor(...this.colors.primary);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(
      this.margin,
      this.currentY,
      this.pageWidth - this.margin,
      this.currentY,
    );
    this.currentY += 10;
  }

  private addTitlePage(stateMachine: StateMachine) {
    this.pdf.setFillColor(...this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 40, "F");
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.setFontSize(26);
    this.pdf.text("FSM Design Report", this.margin, 25);

    this.currentY = 60;
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.setFontSize(18);
    this.pdf.text(
      stateMachine.name || "Untitled Machine",
      this.margin,
      this.currentY,
    );
    this.currentY += 10;
    this.pdf.setFontSize(12);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(
      `Type: ${
        stateMachine.type === "mealy" ? "Mealy Machine" : "Moore Machine"
      }`,
      this.margin,
      this.currentY,
    );
    this.currentY += 8;
    this.pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      this.margin,
      this.currentY,
    );

    if (stateMachine.description) {
      this.currentY += 15;
      this.pdf.setFont("helvetica", "italic");
      this.pdf.setTextColor(100, 100, 100);
      const splitDesc = this.pdf.splitTextToSize(
        stateMachine.description,
        this.pageWidth - this.margin * 2,
      );
      this.pdf.text(splitDesc, this.margin, this.currentY);
      this.currentY += splitDesc.length * 5 + 10;
    }

    this.currentY = Math.max(this.currentY + 10, 130);
    autoTable(this.pdf, {
      startY: this.currentY,
      head: [["Statistic", "Value"]],
      body: [
        ["Total States", stateMachine.states.length],
        ["Total Transitions", stateMachine.transitions.length],
        ["Input Variables", stateMachine.inputVariables.length],
        ["Output Variables", stateMachine.outputVariables.length],
        ["Internal Variables", stateMachine.stateVariables.length],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    });
    this.pdf.addPage();
    this.currentY = this.margin;
  }

  // --- Content Sections ---

  private async addDiagramSection() {
    this.addSectionHeader("System Diagram");
    try {
      const imgData = await this.captureCanvasScreenshot();
      if (imgData) {
        const imgProps = this.pdf.getImageProperties(imgData);
        const pdfWidth = this.pageWidth - this.margin * 2;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        this.checkPageBreak(pdfHeight);
        this.pdf.addImage(
          imgData,
          "JPEG",
          this.margin,
          this.currentY,
          pdfWidth,
          pdfHeight,
        );
        this.currentY += pdfHeight + 10;
      } else {
        this.pdf.setTextColor(...this.colors.error);
        this.pdf.text(
          "Diagram screenshot could not be captured.",
          this.margin,
          this.currentY + 5,
        );
      }
    } catch (e) {
      this.pdf.text("Error rendering diagram.", this.margin, this.currentY + 5);
    }
  }

  private addStateTable(states: State[]) {
    this.addSectionHeader("State Definitions");
    autoTable(this.pdf, {
      startY: this.currentY,
      head: [["State Name", "Initial", "Final", "Notes"]],
      body: states.map((s) => [
        s.name,
        s.isInitial ? "Yes" : "No",
        s.isFinal ? "Yes" : "No",
        s.notes || "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: this.colors.primary },
      styles: { fontSize: 9, valign: "middle" },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addTransitionTable(transitions: Transition[], states: State[]) {
    this.addSectionHeader("Transition Logic");
    const getName = (id: string) => states.find((s) => s.id === id)?.name || id;
    autoTable(this.pdf, {
      startY: this.currentY,
      head: [["From", "To", "Input", "Guard", "Action", "Output"]],
      body: transitions.map((t) => [
        getName(t.from),
        getName(t.to),
        t.input || "-",
        t.guard || "-",
        t.action || "-",
        t.output || "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: this.colors.secondary },
      styles: { fontSize: 8, overflow: "linebreak" },
    });
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addVerificationReport(data: VerificationData) {
    this.addSectionHeader("Verification Report");
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(
      ...(data.isValid ? this.colors.accent : this.colors.error),
    );
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(
      data.isValid
        ? "✓ PASSED: Valid Model Structure"
        : "⚠ FAILED: Structural Issues Detected",
      this.margin,
      this.currentY + 5,
    );
    this.currentY += 15;

    const allIssues = [
      ...data.errors.map((e) => ({ type: "ERROR", msg: e })),
      ...data.deadlocks.map((d) => ({
        type: "DEADLOCK",
        msg: `Deadlock state: ${d}`,
      })),
      ...data.warnings.map((w) => ({ type: "WARNING", msg: w })),
    ];

    if (allIssues.length > 0) {
      autoTable(this.pdf, {
        startY: this.currentY,
        head: [["Severity", "Description"]],
        body: allIssues.map((i) => [i.type, i.msg]),
        theme: "grid",
        styles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            if (data.cell.raw === "ERROR" || data.cell.raw === "DEADLOCK") {
              data.cell.styles.textColor = this.colors.error;
              data.cell.styles.fontStyle = "bold";
            } else if (data.cell.raw === "WARNING") {
              data.cell.styles.textColor = [255, 152, 0];
            }
          }
        },
      });
      this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
    } else {
      this.pdf.setFont("helvetica", "italic");
      this.pdf.setTextColor(...this.colors.secondary);
      this.pdf.text("No issues detected.", this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addSimulationReport(data: SimulationData) {
    this.addSectionHeader("Simulation Results");
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(...this.colors.secondary);
    this.pdf.text(
      `Simulation Input Sequence: [${data.inputs.join(", ")}]`,
      this.margin,
      this.currentY + 5,
    );
    this.currentY += 10;

    autoTable(this.pdf, {
      startY: this.currentY,
      head: [["Step", "Current State", "Input", "Output"]],
      body: data.result.steps.map((step, i) => [
        i + 1,
        step.state,
        step.input,
        step.output || "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: [156, 39, 176] },
    });
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;

    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(
      `Final State: ${data.result.finalState}`,
      this.margin,
      this.currentY + 5,
    );
    this.currentY += 10;
  }

  private addTestCasesReport(testCases: TestCaseData[]) {
    this.addSectionHeader("Test Case Execution");
    autoTable(this.pdf, {
      startY: this.currentY,
      head: [["Test Name", "Inputs", "Expected Output", "Status"]],
      body: testCases.map((tc) => [
        tc.name,
        tc.inputs.join(", "),
        tc.expectedOutput,
        tc.status,
      ]),
      theme: "grid",
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          if (data.cell.raw === "PASS")
            data.cell.styles.textColor = this.colors.accent;
          if (data.cell.raw === "FAIL")
            data.cell.styles.textColor = this.colors.error;
        }
      },
    });
    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addFooterNumbers() {
    const pageCount = this.pdf.getNumberOfPages();
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" },
      );
    }
  }

  // --- Main Export Method ---

  public async export(
    stateMachine: StateMachine,
    options: ExportOptions,
    data: {
      verification?: VerificationData;
      simulation?: SimulationData;
      testCases?: TestCaseData[];
    } = {},
  ) {
    this.initializePDF();
    this.addTitlePage(stateMachine);

    if (options.includeDiagram) await this.addDiagramSection();
    if (options.includeStateTable) this.addStateTable(stateMachine.states);
    if (options.includeTransitions)
      this.addTransitionTable(stateMachine.transitions, stateMachine.states);

    if (options.includeVerification && data.verification) {
      this.addVerificationReport(data.verification);
    }
    if (options.includeSimulation && data.simulation) {
      this.addSimulationReport(data.simulation);
    }
    if (options.includeTestCases && data.testCases) {
      this.addTestCasesReport(data.testCases);
    }

    this.addFooterNumbers();
    this.pdf.save(`${stateMachine.name.replace(/\s+/g, "_")}_Report.pdf`);
  }
}

export const pdfExportService = new PDFExportService();
