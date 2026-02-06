"use client";

import { useState } from "react";
import type { Configuration } from "@/lib/api-client";
import { computeConfigSummary } from "@/lib/utils/calculations";
import { ConfigHeader } from "./ConfigHeader";
import { ConfigFlags } from "./ConfigFlags";
import { ItemSearch } from "./ItemSearch";
import { PartsTable } from "./PartsTable";
import { SummaryPanel } from "./SummaryPanel";
import { ContactInfo } from "./ContactInfo";
import { ScopeOfWork } from "./ScopeOfWork";
import { CsvUpload } from "./CsvUpload";

interface ConfiguratorPageProps {
  configuration: Configuration;
  estimateId?: string | null;
}

type TabId = "configuration" | "parts" | "details";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: "configuration",
    label: "Configuration",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "parts",
    label: "Parts & Pricing",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: "details",
    label: "Contact & Scope",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function ConfiguratorPage({ configuration: initialConfig, estimateId }: ConfiguratorPageProps) {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<TabId>("parts");

  const summary = computeConfigSummary({
    lineItems: config.lineItems.map((li) => ({
      extCost: Number(li.extCost),
      totalPrice: Number(li.totalPrice),
      quantity: li.quantity,
    })),
    shippingFee: Number(config.shippingFee),
    shippingOverride: config.shippingOverride,
  });

  const handleConfigUpdate = (updated: Configuration) => {
    setConfig(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <ConfigHeader
        config={config}
        summary={summary}
        onConfigUpdate={handleConfigUpdate}
        configuratorType="box-sales"
        estimateId={estimateId}
      />

      <div className="max-w-[1600px] mx-auto">
        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "parts" && config.lineItems.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
                    {config.lineItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 p-6 pt-4">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Configuration Tab */}
            {activeTab === "configuration" && (
              <div className="animate-in fade-in duration-200">
                <ConfigFlags config={config} onConfigUpdate={handleConfigUpdate} />
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === "parts" && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
                  {/* Search + CSV header bar */}
                  <div className="px-5 py-4 border-b border-border/30">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <ItemSearch
                          configId={config.id}
                          onItemAdded={handleConfigUpdate}
                        />
                      </div>
                      <div className="shrink-0">
                        <CsvUpload
                          configId={config.id}
                          onImportComplete={handleConfigUpdate}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parts table */}
                  <PartsTable
                    config={config}
                    onConfigUpdate={handleConfigUpdate}
                    allowCustomMargin={config.allowCustomMargin}
                  />
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="animate-in fade-in duration-200 space-y-6">
                <ContactInfo config={config} onConfigUpdate={handleConfigUpdate} />
                <ScopeOfWork config={config} onConfigUpdate={handleConfigUpdate} />
              </div>
            )}
          </div>

          {/* Summary sidebar - always visible */}
          <div className="w-[340px] shrink-0">
            <SummaryPanel
              summary={summary}
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
