"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration, downloadProjectProposal } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";
import { ProposalSectionEditor } from "./ProposalSectionEditor";
import { ProposalMaterialsPreview } from "./ProposalMaterialsPreview";
import { Button, Card, Input, Select, SectionHeader, Badge, LoadingText } from "@/components/ui";

interface ProposalBuilderTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

const ICONS = {
  document: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const PROPOSAL_SECTIONS = [
  { key: "introduction", label: "Introduction", field: "introduction", description: "Opening text that appears at the beginning of the Statement of Work section." },
  { key: "installationScope", label: "Statement of Work", field: "installationScope", description: "Detailed description of the installation work to be performed." },
  { key: "customerProvidedScope", label: "Customer Provided Equipment & Services", field: "customerProvidedScope", description: "Equipment and services the customer will provide for the project." },
  { key: "proServicesScope", label: "Professional Services Scope", field: "proServicesScope", description: "Scope of professional services work. Only shown when Professional Services is enabled." },
  { key: "solutionsArchitectScope", label: "Solutions Architect Scope", field: "solutionsArchitectScope", description: "Scope of solutions architect work. Only shown when SA is enabled." },
  { key: "constraintsAssumptions", label: "Constraints & Assumptions", field: "constraintsAssumptions", description: "Key constraints and assumptions that apply to this project." },
  { key: "exclusions", label: "Exclusions", field: "exclusions", description: "Work items explicitly excluded from the project scope." },
  { key: "focusScope", label: "FOCUS Scope", field: "focusScope", description: "FOCUS post-installation support details. Only shown when Post-Install Plan is set to FOCUS." },
];

const TERMS_OPTIONS = [
  { value: "", label: "Select terms type..." },
  { value: "CUSTOM_TERMS", label: "Custom Terms of Sale" },
  { value: "EXISTING_MSA", label: "Existing MSA" },
  { value: "STANDARD", label: "Standard Terms" },
];

export function ProposalBuilderTab({ config, onConfigUpdate }: ProposalBuilderTabProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Contact info state
  const [firstName, setFirstName] = useState(config.contactFirstName || "");
  const [lastName, setLastName] = useState(config.contactLastName || "");
  const [email, setEmail] = useState(config.contactEmail || "");

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => {
      onConfigUpdate(data.configuration);
      setSavingField(null);
    },
    onError: () => {
      setSavingField(null);
    },
  });

  const handleSectionChange = useCallback(
    (field: string, value: string) => {
      setSavingField(field);
      updateMutation.mutate({ [field]: value || null });
    },
    [updateMutation]
  );

  const handleFieldSave = useCallback(
    (field: string, value: string | null) => {
      setSavingField(field);
      updateMutation.mutate({ [field]: value });
    },
    [updateMutation]
  );

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const blob = await downloadProjectProposal(config.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proposal-${config.estimateNumber || config.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Failed to generate proposal"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter sections based on configuration
  const visibleSections = PROPOSAL_SECTIONS.filter((section) => {
    if (["introduction", "installationScope", "customerProvidedScope", "constraintsAssumptions", "exclusions"].includes(section.key)) {
      return true;
    }
    if (section.key === "proServicesScope" || section.key === "solutionsArchitectScope") {
      return config.proServicesOrSA === true;
    }
    if (section.key === "focusScope") {
      return config.postInstallPlan === "FOCUS";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon={ICONS.document}
        title="Proposal Builder"
        description="Review and edit proposal content, then download the PDF"
        action={
          <Button
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            leftIcon={!isDownloading ? ICONS.download : undefined}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        }
      />

      {/* Download error */}
      {downloadError && (
        <Card className="bg-status-error-bg border-status-error/30">
          <div className="flex items-center gap-2 text-status-error-text">
            <strong>Error:</strong> {downloadError}
          </div>
        </Card>
      )}

      {/* Materials & Labor Preview */}
      <ProposalMaterialsPreview config={config} />

      {/* Contact Information & Terms */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contact Information */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">{ICONS.user}</span>
            <h4 className="font-semibold text-foreground">Contact Information</h4>
            {savingField?.startsWith("contact") && updateMutation.isPending && (
              <LoadingText text="Saving..." size="sm" className="ml-auto" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => handleFieldSave("contactFirstName", firstName || null)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => handleFieldSave("contactLastName", lastName || null)}
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleFieldSave("contactEmail", email || null)}
          />
        </Card>

        {/* Terms */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">{ICONS.clipboard}</span>
            <h4 className="font-semibold text-foreground">Terms of Sale</h4>
            {savingField === "termsType" && updateMutation.isPending && (
              <LoadingText text="Saving..." size="sm" className="ml-auto" />
            )}
          </div>
          <Select
            label="Terms Type"
            value={config.termsType || ""}
            onChange={(e) => handleFieldSave("termsType", e.target.value || null)}
            options={TERMS_OPTIONS}
            helperText="The selected terms will be included in the proposal PDF."
          />
        </Card>
      </div>

      {/* Jump Links */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground mr-2">Jump to:</span>
        {visibleSections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveSection(section.key)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeSection === section.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Editable Sections */}
      <div className="space-y-4">
        {visibleSections.map((section) => (
          <ProposalSectionEditor
            key={section.key}
            section={section}
            value={(config[section.field as keyof ProjectConfiguration] as string) || ""}
            isActive={activeSection === section.key}
            onActivate={() => setActiveSection(activeSection === section.key ? null : section.key)}
            onChange={(value) => handleSectionChange(section.field, value)}
            isSaving={savingField === section.field && updateMutation.isPending}
          />
        ))}
      </div>

      {/* Help text */}
      <Card className="bg-status-info-bg border-status-info/30">
        <div className="flex items-start gap-2 text-status-info-text">
          <span className="mt-0.5 flex-shrink-0 text-status-info">{ICONS.info}</span>
          <div className="text-sm">
            <strong>Tip:</strong> Changes are automatically saved as you type.
            The proposal PDF will include all content from these sections, along
            with materials organized by location and consolidated labor details.
          </div>
        </div>
      </Card>
    </div>
  );
}
