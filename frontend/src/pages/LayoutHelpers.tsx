// src/pages/LayoutHelpers.tsx
import React from "react";
import styles from "./EditorPage.module.css";
import { RightPanelTab } from "./EditorTypes";

// --- ToolbarButton ---
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  active,
  disabled,
  danger,
  onClick,
}) => {
  let className = styles.toolbarBtn;
  if (active) className += ` ${styles.toolbarBtnActive}`;
  if (disabled) className += ` ${styles.toolbarBtnDisabled}`;
  if (danger) className += ` ${styles.toolbarBtnDanger}`;
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

// --- TabButton ---
interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  id: RightPanelTab;
  current: RightPanelTab;
  collapsed: boolean;
  onClick: (id: RightPanelTab) => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  id,
  current,
  collapsed,
  onClick,
}) => {
  if (collapsed) {
    let className = styles.iconTabBtn;
    if (current === id) className += ` ${styles.iconTabBtnActive}`;
    return (
      <button onClick={() => onClick(id)} title={label} className={className}>
        {icon}
      </button>
    );
  }
  let className = styles.tabBtn;
  if (current === id) className += ` ${styles.tabBtnActive}`;
  return (
    <button onClick={() => onClick(id)} className={className}>
      {icon}
      <span>{label}</span>
    </button>
  );
};
