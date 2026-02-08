"use client";

import type { ProjectConfiguration, ProjectLineCategory } from "@/lib/api-client";
import { ProjectItemSearch } from "../ProjectItemSearch";
import { ProjectPartsTable } from "../ProjectPartsTable";

interface LaborTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

interface LaborCategory {
  id: string;
  title: string;
  description: string;
  category: ProjectLineCategory;
  hasMargin: boolean;
  searchPlaceholder: string;
}

const LABOR_CATEGORIES: LaborCategory[] = [
  {
    id: "installation",
    title: "Installation Labor",
    description: "Part #, Description, Qty, Cost, Unit Price, Total Price",
    category: "INSTALLATION_LABOR",
    hasMargin: false,
    searchPlaceholder: "Search for installation labor items...",
  },
  {
    id: "subcontractor",
    title: "Subcontractor Labor",
    description: "Part #, Description, Qty, Cost, Unit Price, Total Price, Margin",
    category: "SUBCONTRACTOR_LABOR",
    hasMargin: true,
    searchPlaceholder: "Search for subcontractor labor items...",
  },
  {
    id: "project-management",
    title: "Project Management Labor",
    description: "Part #, Description, Qty, Cost, Unit Price, Total Price",
    category: "PROJECT_MANAGEMENT",
    hasMargin: false,
    searchPlaceholder: "Search for project management labor items...",
  },
  {
    id: "misc",
    title: "Misc. Labor",
    description: "Part #, Description, Qty, Cost, Unit Price, Total Price",
    category: "MISC_LABOR",
    hasMargin: false,
    searchPlaceholder: "Search for misc. labor items...",
  },
  {
    id: "travel",
    title: "Travel Costs",
    description: "Part #, Description, Qty, Cost, Unit Price, Total Price, Margin",
    category: "TRAVEL_COSTS",
    hasMargin: true,
    searchPlaceholder: "Search for travel cost items...",
  },
];

export function LaborTab({ config, onConfigUpdate }: LaborTabProps) {
  return (
    <div className="space-y-6">
      {LABOR_CATEGORIES.map((cat) => {
        const items = config.lineItems.filter((li) => li.category === cat.category);

        return (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              {items.length > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
                  {items.length}
                </span>
              )}
            </div>
            <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
              {/* Item Search */}
              <div className="px-5 py-4 border-b border-border/30">
                <ProjectItemSearch
                  configId={config.id}
                  category={cat.category}
                  onItemAdded={onConfigUpdate}
                  placeholder={cat.searchPlaceholder}
                />
              </div>

              {/* Parts Table */}
              <ProjectPartsTable
                config={config}
                category={cat.category}
                onConfigUpdate={onConfigUpdate}
                showLocation={false}
                showTariff={false}
                showMargin={cat.hasMargin}
                allowCustomMargin={config.allowCustomMargin}
                allowPriceEdit={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
