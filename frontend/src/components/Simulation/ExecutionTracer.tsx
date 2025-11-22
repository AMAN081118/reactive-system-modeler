// components/Simulation/ExecutionTracer.tsx
import React, { useEffect, useRef } from "react";
import styles from "./Simulation.module.css";
import { Terminal } from "lucide-react";

// This type is inferred from simExecutionHistory in EditorPage.tsx
interface ExecutionStep {
  step: number;
  currentState: string;
  nextState: string;
  input: string;
  output: string | undefined;
}

interface ExecutionTracerProps {
  executionHistory: ExecutionStep[];
  currentStep: number;
  totalSteps: number;
}

const ExecutionTracer: React.FC<ExecutionTracerProps> = ({
  executionHistory,
  currentStep,
  totalSteps,
}) => {
  const activeRowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRowRef.current && listRef.current) {
      // Scroll to keep the active item in view
      const list = listRef.current;
      const item = activeRowRef.current;
      const listRect = list.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (itemRect.bottom > listRect.bottom) {
        list.scrollTop += itemRect.bottom - listRect.bottom;
      } else if (itemRect.top < listRect.top) {
        list.scrollTop -= listRect.top - itemRect.top;
      }
    }
  }, [currentStep]);

  return (
    <div className={styles.tracerContainer}>
      <div className={styles.tracerHeader}>
        <h4>
          <Terminal size={16} style={{ marginRight: "8px" }} />
          Execution Trace
        </h4>
        <span>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className={styles.tracerList} ref={listRef}>
        {executionHistory.map((item, index) => {
          const isActive = index + 1 === currentStep;
          return (
            <div
              key={item.step}
              ref={isActive ? activeRowRef : null}
              className={`${styles.tracerRow} ${
                isActive ? styles.tracerRowActive : ""
              }`}
            >
              <span className={styles.stepNumber}>{item.step}.</span>
              <span>{item.currentState}</span>
              <span>
                &rarr; (<strong>{item.input}</strong> /{" "}
                {item.output || <em>&epsilon;</em>})
              </span>
              <span>{item.nextState}</span>
            </div>
          );
        })}
        {executionHistory.length === 0 && (
          <div
            style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}
          >
            Run a simulation to see the trace.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionTracer;
