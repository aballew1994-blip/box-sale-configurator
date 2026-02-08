"use client";

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import type { ProjectConfiguration } from "@/lib/api-client";
import type { WizardContextValue, ProposalSection } from "./types";
import { PROPOSAL_SECTIONS } from "./constants";

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
  config: ProjectConfiguration;
  children: ReactNode;
}

export function WizardProvider({ config, children }: WizardProviderProps) {
  // Filter sections based on configuration conditions
  const visibleSections = useMemo(() => {
    return PROPOSAL_SECTIONS.filter((section) => {
      if (!section.condition) return true;
      return section.condition(config);
    });
  }, [config]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [skippedSections, setSkippedSections] = useState<Set<string>>(new Set());
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Build section values from config
  const sectionValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const section of PROPOSAL_SECTIONS) {
      const value = config[section.field as keyof ProjectConfiguration];
      values[section.field] = typeof value === "string" ? value : "";
    }
    return values;
  }, [config]);

  // Determine completed sections (non-empty content)
  const completedSections = useMemo(() => {
    const completed = new Set<string>();
    for (const section of visibleSections) {
      const value = sectionValues[section.field];
      if (value && value.trim().length > 0) {
        completed.add(section.key);
      }
    }
    return completed;
  }, [visibleSections, sectionValues]);

  const currentSection = visibleSections[currentSectionIndex] || null;
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === visibleSections.length - 1;
  const completedCount = completedSections.size;
  const completionPercentage = visibleSections.length > 0
    ? Math.round((completedCount / visibleSections.length) * 100)
    : 0;

  const goToSection = useCallback((index: number) => {
    if (index >= 0 && index < visibleSections.length) {
      setCurrentSectionIndex(index);
    }
  }, [visibleSections.length]);

  const goNext = useCallback(() => {
    if (currentSectionIndex < visibleSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }, [currentSectionIndex, visibleSections.length]);

  const goPrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  }, [currentSectionIndex]);

  const skipSection = useCallback(() => {
    if (currentSection) {
      setSkippedSections((prev) => new Set(prev).add(currentSection.key));
    }
    goNext();
  }, [currentSection, goNext]);

  // Note: updateSectionValue and resetSection are handled by the parent component
  // since they need to trigger API calls. These are placeholder implementations.
  const updateSectionValue = useCallback((field: string, value: string) => {
    // This will be handled by parent via onConfigUpdate
    console.log("Update section value:", field, value.length);
  }, []);

  const resetSection = useCallback((field: string) => {
    const section = PROPOSAL_SECTIONS.find((s) => s.field === field);
    if (section) {
      // This will be handled by parent via onConfigUpdate
      console.log("Reset section:", field, "to default:", section.defaultValue);
    }
  }, []);

  const value: WizardContextValue = {
    config,
    currentSectionIndex,
    sections: visibleSections,
    completedSections,
    skippedSections,
    sectionValues,
    savingSection,
    saveError,
    currentSection,
    isFirstSection,
    isLastSection,
    completionPercentage,
    completedCount,
    goToSection,
    goNext,
    goPrevious,
    skipSection,
    updateSectionValue,
    resetSection,
    setSavingSection,
    setSaveError,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
