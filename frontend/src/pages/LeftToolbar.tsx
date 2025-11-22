// src/pages/LeftToolbar.tsx
import React from "react";
import {
  MousePointer2,
  ArrowRightLeft,
  PlusCircle,
  Trash2,
  Info,
  BookOpen,
} from "lucide-react";
import { useEditor } from "./EditorContext";
import { ToolbarButton } from "./LayoutHelpers";
import styles from "./EditorPage.module.css";

const LeftToolbar: React.FC = () => {
  const {
    isTransitionMode,
    isSimulating,
    setIsTransitionMode,
    handleSimReset,
    setRightPanelTab,
    handleAddState,
    selectedStateId,
    selectedTransitionId,
    handleDeleteSelected,
    descPanelOpen,
    setDescPanelOpen,
    setExamplesOpen,
  } = useEditor();

  return (
    <div className={styles.leftToolbar}>
      <div className={styles.toolbarSectionTitle}>Tools</div>
      <ToolbarButton
        icon={<MousePointer2 size={18} />}
        label="Select"
        active={!isTransitionMode && !isSimulating}
        onClick={() => {
          setIsTransitionMode(false);
          handleSimReset();
          setRightPanelTab("properties");
        }}
        disabled={isSimulating}
      />
      <ToolbarButton
        icon={<ArrowRightLeft size={18} />}
        label="Connect"
        active={isTransitionMode}
        onClick={() => {
          setIsTransitionMode(true);
          handleSimReset();
          setRightPanelTab("properties");
        }}
        disabled={isSimulating}
      />
      <div className={styles.toolbarDivider} />
      <div className={styles.toolbarSectionTitle}>Nodes</div>
      <ToolbarButton
        icon={<PlusCircle size={18} />}
        label="State"
        onClick={() => handleAddState(false)}
        disabled={isSimulating}
      />
      <ToolbarButton
        icon={<PlusCircle size={18} />}
        label="Initial State"
        onClick={() => handleAddState(true)}
        disabled={isSimulating}
      />
      <div className={styles.toolbarDivider} />
      <div className={styles.toolbarSectionTitle}>Actions</div>
      <ToolbarButton
        icon={<Trash2 size={18} />}
        label="Delete"
        disabled={(!selectedStateId && !selectedTransitionId) || isSimulating}
        onClick={handleDeleteSelected}
        danger
      />
      <ToolbarButton
        icon={<Info size={18} />}
        label="Info"
        active={descPanelOpen}
        onClick={() => setDescPanelOpen(!descPanelOpen)}
      />
      <ToolbarButton
        icon={<BookOpen size={18} />}
        label="Examples"
        onClick={() => setExamplesOpen(true)}
        disabled={isSimulating}
      />
      <div className={styles.spacer} />
    </div>
  );
};

export default LeftToolbar;
