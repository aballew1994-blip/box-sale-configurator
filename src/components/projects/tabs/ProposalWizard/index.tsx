"use client";

import { useState } from "react";
import type { ProjectConfiguration } from "@/lib/api-client";
import { downloadProjectProposal } from "@/lib/api-client";
import { WizardProvider } from "./WizardContext";
import { WizardProgressBar } from "./WizardProgressBar";
import { WizardDocumentPreview } from "./WizardDocumentPreview";
import { WizardSectionEditor } from "./WizardSectionEditor";
import { WizardNavigation } from "./WizardNavigation";
import { Button, Card, SectionHeader } from "@/components/ui";

interface ProposalWizardProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function ProposalWizard({ config, onConfigUpdate }: ProposalWizardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

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

  const handleComplete = () => {
    setShowCompletionMessage(true);
    handleDownloadPdf();
  };

  return (
    <WizardProvider config={config}>
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <SectionHeader
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="Proposal Builder"
          description="Build your proposal section by section with live preview"
          action={
            <Button
              onClick={handleDownloadPdf}
              isLoading={isDownloading}
              leftIcon={
                !isDownloading ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : undefined
              }
            >
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
          }
        />

        {/* Download error */}
        {downloadError && (
          <Card className="bg-status-error-bg border-status-error/30">
            <div className="flex items-center gap-2 text-status-error-text">
              <svg className="w-5 h-5 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <strong>Error:</strong> {downloadError}
            </div>
          </Card>
        )}

        {/* Completion message */}
        {showCompletionMessage && !downloadError && !isDownloading && (
          <Card className="bg-status-success-bg border-status-success/30">
            <div className="flex items-center gap-2 text-status-success-text">
              <svg className="w-5 h-5 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your proposal PDF has been downloaded. You can continue editing or download again at any time.</span>
            </div>
          </Card>
        )}

        {/* Progress bar */}
        <WizardProgressBar />

        {/* Split view: Preview + Editor */}
        <div className="flex-1 grid grid-cols-[55%_45%] gap-4 min-h-0">
          {/* Left: Document Preview */}
          <div className="min-h-0 overflow-hidden">
            <WizardDocumentPreview onConfigUpdate={onConfigUpdate} />
          </div>

          {/* Right: Section Editor */}
          <div className="min-h-0 flex flex-col">
            <WizardSectionEditor onConfigUpdate={onConfigUpdate} />
            <WizardNavigation onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </WizardProvider>
  );
}

export { WizardProvider, useWizard } from "./WizardContext";
