// src/pages/EditorHeader.tsx
import React from "react";
import { Activity } from "lucide-react";
import { useEditor } from "./EditorContext";
import styles from "./EditorPage.module.css";

const EditorHeader: React.FC = () => {
  const { stateMachine } = useEditor();

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <Activity size={24} />
        <h1 className={styles.appTitle}>FSM Designer</h1>
      </div>
      <div className={styles.headerStats}>
        <span>States: {stateMachine.states.length}</span>
        <div className={styles.separator} />
        <span>Transitions: {stateMachine.transitions.length}</span>
      </div>
    </header>
  );
};

export default EditorHeader;
