"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from "react";

// Context for Tabs
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Main Tabs container
export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultTab?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function Tabs({
  defaultTab,
  value,
  onValueChange,
  className = "",
  children,
  ...props
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab || "");

  const activeTab = value ?? internalTab;
  const setActiveTab = (id: string) => {
    if (!value) {
      setInternalTab(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab List (container for tab buttons)
export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TabList({ className = "", children, ...props }: TabListProps) {
  return (
    <div
      role="tablist"
      className={`
        flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Individual Tab button
export interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

export function TabTrigger({
  value,
  icon,
  badge,
  disabled = false,
  className = "",
  children,
  ...props
}: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg
        text-sm font-medium
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isActive
            ? "bg-surface text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
        }
        ${className}
      `}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
      {badge}
    </button>
  );
}

// Tab Content panel
export interface TabContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabContent({
  value,
  className = "",
  children,
  ...props
}: TabContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={`animate-in fade-in duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
