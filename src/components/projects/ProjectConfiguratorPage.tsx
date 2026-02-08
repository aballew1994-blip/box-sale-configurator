"use client";

import { useState } from "react";
import type { ProjectConfiguration } from "@/lib/api-client";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectSummaryPanel } from "./ProjectSummaryPanel";
import { ProjectDetailsTab } from "./tabs/ProjectDetailsTab";
import { MaterialsTab } from "./tabs/MaterialsTab";
import { LaborTab } from "./tabs/LaborTab";
import { ScopeOfWorkTab } from "./tabs/ScopeOfWorkTab";
import { ProposalDetailsTab } from "./tabs/ProposalDetailsTab";
import { ProposalWizard } from "./tabs/ProposalWizard";
import { computeProjectSummary } from "@/lib/utils/projectCalculations";
import { Tabs, TabList, TabTrigger, TabContent, Badge } from "@/components/ui";

interface ProjectConfiguratorPageProps {
  configuration: ProjectConfiguration;
  estimateId?: string | null;
}

type TabId = "details" | "materials" | "labor" | "scope" | "proposal" | "builder";

const TAB_ICONS = {
  details: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  materials: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  labor: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  scope: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  proposal: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  builder: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export function ProjectConfiguratorPage({
  configuration: initialConfig,
  estimateId,
}: ProjectConfiguratorPageProps) {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<TabId>("details");

  const summary = computeProjectSummary(config);

  const handleConfigUpdate = (updated: ProjectConfiguration) => {
    setConfig(updated);
  };

  // Count items per category for badges
  const materialsCount = config.lineItems.filter(
    (li) => li.category === "TSI_PROVIDED_PARTS" || li.category === "SUBCONTRACTOR_PARTS"
  ).length;
  const laborCount = config.lineItems.filter(
    (li) =>
      li.category === "INSTALLATION_LABOR" ||
      li.category === "SUBCONTRACTOR_LABOR" ||
      li.category === "PROJECT_MANAGEMENT" ||
      li.category === "MISC_LABOR" ||
      li.category === "TRAVEL_COSTS"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader
        config={config}
        summary={summary}
        onConfigUpdate={handleConfigUpdate}
        estimateId={estimateId}
      />

      <div className="max-w-[1600px] mx-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          {/* Tab Navigation */}
          <div className="px-6 pt-4">
            <TabList>
              <TabTrigger value="details" icon={TAB_ICONS.details}>
                Project Details
              </TabTrigger>
              <TabTrigger
                value="materials"
                icon={TAB_ICONS.materials}
                badge={
                  materialsCount > 0 ? (
                    <Badge variant="accent" size="sm">{materialsCount}</Badge>
                  ) : undefined
                }
              >
                Materials
              </TabTrigger>
              <TabTrigger
                value="labor"
                icon={TAB_ICONS.labor}
                badge={
                  laborCount > 0 ? (
                    <Badge variant="accent" size="sm">{laborCount}</Badge>
                  ) : undefined
                }
              >
                Labor
              </TabTrigger>
              <TabTrigger value="scope" icon={TAB_ICONS.scope}>
                Scope of Work
              </TabTrigger>
              <TabTrigger value="proposal" icon={TAB_ICONS.proposal}>
                Proposal Details
              </TabTrigger>
              <TabTrigger value="builder" icon={TAB_ICONS.builder}>
                Proposal Builder
              </TabTrigger>
            </TabList>
          </div>

          <div className="flex gap-6 p-6 pt-4">
            {/* Main content */}
            <div className={`min-w-0 ${activeTab === "builder" ? "flex-1" : "flex-1"}`}>
              <TabContent value="details">
                <ProjectDetailsTab config={config} onConfigUpdate={handleConfigUpdate} />
              </TabContent>

              <TabContent value="materials">
                <MaterialsTab config={config} onConfigUpdate={handleConfigUpdate} />
              </TabContent>

              <TabContent value="labor">
                <LaborTab config={config} onConfigUpdate={handleConfigUpdate} />
              </TabContent>

              <TabContent value="scope">
                <ScopeOfWorkTab config={config} onConfigUpdate={handleConfigUpdate} />
              </TabContent>

              <TabContent value="proposal">
                <ProposalDetailsTab config={config} onConfigUpdate={handleConfigUpdate} />
              </TabContent>

              <TabContent value="builder">
                <div className="h-[calc(100vh-220px)]">
                  <ProposalWizard config={config} onConfigUpdate={handleConfigUpdate} />
                </div>
              </TabContent>
            </div>

            {/* Summary sidebar - hidden when builder tab is active */}
            {activeTab !== "builder" && (
              <div className="w-[340px] shrink-0">
                <ProjectSummaryPanel summary={summary} config={config} />
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
