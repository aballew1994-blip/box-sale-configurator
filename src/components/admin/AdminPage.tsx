"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TableFiltersTab } from "./tabs/TableFiltersTab";
import { FormFieldsTab } from "./tabs/FormFieldsTab";
import { NetSuiteMappingTab } from "./tabs/NetSuiteMappingTab";
import { TariffMaintenanceTab } from "./tabs/TariffMaintenanceTab";

const queryClient = new QueryClient();

type TabId = "table-filters" | "form-fields" | "tariff-maintenance" | "netsuite-mapping";

const TABS: { id: TabId; label: string }[] = [
  { id: "table-filters", label: "Table Filters" },
  { id: "form-fields", label: "Form Fields" },
  { id: "tariff-maintenance", label: "Tariff Maintenance" },
  { id: "netsuite-mapping", label: "NetSuite Mapping" },
];

function AdminPageContent() {
  const [activeTab, setActiveTab] = useState<TabId>("table-filters");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/configure"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </a>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Admin Configuration
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage table filters, form fields, tariffs, and NetSuite mappings
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-surface border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "table-filters" && <TableFiltersTab />}
        {activeTab === "form-fields" && <FormFieldsTab />}
        {activeTab === "tariff-maintenance" && <TariffMaintenanceTab />}
        {activeTab === "netsuite-mapping" && <NetSuiteMappingTab />}
      </main>
    </div>
  );
}

export function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminPageContent />
    </QueryClientProvider>
  );
}
