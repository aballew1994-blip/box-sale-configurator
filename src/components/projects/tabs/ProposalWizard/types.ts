import type { ProjectConfiguration } from "@/lib/api-client";

export interface ProposalSection {
  key: string;
  label: string;
  field: keyof ProjectConfiguration;
  description: string;
  /** Condition function - returns true if section should be visible */
  condition?: (config: ProjectConfiguration) => boolean;
  /** Default/template text for this section */
  defaultValue?: string;
}

export interface WizardState {
  currentSectionIndex: number;
  sections: ProposalSection[];
  completedSections: Set<string>;
  skippedSections: Set<string>;
  sectionValues: Record<string, string>;
  savingSection: string | null;
  saveError: string | null;
}

export interface WizardActions {
  goToSection: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  skipSection: () => void;
  updateSectionValue: (field: string, value: string) => void;
  resetSection: (field: string) => void;
  setSavingSection: (field: string | null) => void;
  setSaveError: (error: string | null) => void;
}

export interface WizardContextValue extends WizardState, WizardActions {
  config: ProjectConfiguration;
  currentSection: ProposalSection | null;
  isFirstSection: boolean;
  isLastSection: boolean;
  completionPercentage: number;
  completedCount: number;
}
