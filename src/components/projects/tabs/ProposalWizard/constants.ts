import type { ProjectConfiguration } from "@/lib/api-client";
import type { ProposalSection } from "./types";

export const PROPOSAL_SECTIONS: ProposalSection[] = [
  {
    key: "introduction",
    label: "Introduction",
    field: "introduction",
    description: "Opening text that appears at the beginning of the Statement of Work section. Set the context for your proposal.",
    defaultValue: "",
  },
  {
    key: "installationScope",
    label: "Installation Scope",
    field: "installationScope",
    description: "Detailed description of the installation work to be performed. Include specific tasks, deliverables, and technical requirements.",
    defaultValue: "",
  },
  {
    key: "customerProvidedScope",
    label: "Customer Provided Equipment & Services",
    field: "customerProvidedScope",
    description: "Equipment, services, and resources the customer will provide for the project. Be specific about requirements and timing.",
    defaultValue: "",
  },
  {
    key: "proServicesScope",
    label: "Professional Services Scope",
    field: "proServicesScope",
    description: "Scope of professional services work. Define consulting, training, or specialized services included.",
    condition: (config: ProjectConfiguration) => config.proServicesOrSA === true,
    defaultValue: "",
  },
  {
    key: "solutionsArchitectScope",
    label: "Solutions Architect Scope",
    field: "solutionsArchitectScope",
    description: "Scope of solutions architect work. Include design reviews, technical guidance, and architecture deliverables.",
    condition: (config: ProjectConfiguration) => config.proServicesOrSA === true,
    defaultValue: "",
  },
  {
    key: "constraintsAssumptions",
    label: "Constraints & Assumptions",
    field: "constraintsAssumptions",
    description: "Key constraints and assumptions that apply to this project. Include scheduling, access, and technical assumptions.",
    defaultValue: "",
  },
  {
    key: "exclusions",
    label: "Exclusions",
    field: "exclusions",
    description: "Work items explicitly excluded from the project scope. Be clear about what is NOT included to set proper expectations.",
    defaultValue: "",
  },
  {
    key: "focusScope",
    label: "FOCUS Scope",
    field: "focusScope",
    description: "FOCUS post-installation support details. Define the support period, services included, and response times.",
    condition: (config: ProjectConfiguration) => config.postInstallPlan === "FOCUS",
    defaultValue: "",
  },
];

export const PREVIEW_STYLES = {
  sectionTitle: "text-lg font-bold text-[#1a365d] border-b-[3px] border-[#1a365d] pb-2 mb-4",
  sectionContent: "text-sm leading-relaxed whitespace-pre-wrap",
  placeholder: "text-sm italic text-muted-foreground bg-secondary/30 p-4 rounded border border-dashed border-border/50",
  activeHighlight: "ring-2 ring-primary ring-offset-2 rounded-lg",
  sectionWrapper: "p-4 rounded-lg transition-all duration-200",
};

export const MATERIAL_CATEGORIES = ["TSI_PROVIDED_PARTS", "SUBCONTRACTOR_PARTS"];
export const LABOR_CATEGORIES = [
  "INSTALLATION_LABOR",
  "SUBCONTRACTOR_LABOR",
  "PROJECT_MANAGEMENT",
  "MISC_LABOR",
  "TRAVEL_COSTS",
];

export const CATEGORY_LABELS: Record<string, string> = {
  TSI_PROVIDED_PARTS: "TSI Materials",
  SUBCONTRACTOR_PARTS: "Subcontractor Materials",
  INSTALLATION_LABOR: "Installation Labor",
  SUBCONTRACTOR_LABOR: "Subcontractor Labor",
  PROJECT_MANAGEMENT: "Project Management",
  MISC_LABOR: "Miscellaneous Labor",
  TRAVEL_COSTS: "Travel Costs",
};
