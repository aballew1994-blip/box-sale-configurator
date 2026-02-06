"use client";

import type { ProjectConfiguration } from "@/lib/api-client";
import { ProjectItemSearch } from "../ProjectItemSearch";
import { ProjectPartsTable } from "../ProjectPartsTable";
import { LocationManager } from "../LocationManager";

interface MaterialsTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function MaterialsTab({ config, onConfigUpdate }: MaterialsTabProps) {
  const tsiItems = config.lineItems.filter(
    (li) => li.category === "TSI_PROVIDED_PARTS"
  );
  const subItems = config.lineItems.filter(
    (li) => li.category === "SUBCONTRACTOR_PARTS"
  );

  return (
    <div className="space-y-6">
      {/* Miscellaneous Section - same as Box Sales Configuration */}
      <div>
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Miscellaneous
            </h3>
            <p className="text-sm text-muted-foreground">
              Configuration options for materials
            </p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
          <p className="text-sm text-muted-foreground">
            Configuration toggles (ACS Cards, Custom Margin, Licensing & SSA,
            SaaS) will be added here.
          </p>
        </div>
      </div>

      {/* TSI Provided Parts Section */}
      <div>
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Bill of Materials - TSI Provided Parts
            </h3>
            <p className="text-sm text-muted-foreground">
              Parts provided by TSI
            </p>
          </div>
          {tsiItems.length > 0 && (
            <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
              {tsiItems.length}
            </span>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
          {/* Location Manager */}
          <div className="px-5 pt-5">
            <LocationManager config={config} onConfigUpdate={onConfigUpdate} />
          </div>

          {/* Item Search */}
          <div className="px-5 py-4 border-b border-border/30">
            <ProjectItemSearch
              configId={config.id}
              category="TSI_PROVIDED_PARTS"
              onItemAdded={onConfigUpdate}
              placeholder="Search for TSI provided parts..."
            />
          </div>

          {/* Parts Table */}
          <ProjectPartsTable
            config={config}
            category="TSI_PROVIDED_PARTS"
            onConfigUpdate={onConfigUpdate}
            showLocation={true}
            showTariff={true}
            showMargin={true}
            allowCustomMargin={config.allowCustomMargin}
          />
        </div>
      </div>

      {/* Subcontractor Provided Parts Section */}
      <div>
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
              Subcontractor Provided Parts
            </h3>
            <p className="text-sm text-muted-foreground">
              Parts provided by subcontractors (no tariff)
            </p>
          </div>
          {subItems.length > 0 && (
            <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
              {subItems.length}
            </span>
          )}
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
          {/* Item Search */}
          <div className="px-5 py-4 border-b border-border/30">
            <ProjectItemSearch
              configId={config.id}
              category="SUBCONTRACTOR_PARTS"
              onItemAdded={onConfigUpdate}
              placeholder="Search for subcontractor provided parts..."
            />
          </div>

          {/* Parts Table - No Tariff column */}
          <ProjectPartsTable
            config={config}
            category="SUBCONTRACTOR_PARTS"
            onConfigUpdate={onConfigUpdate}
            showLocation={false}
            showTariff={false}
            showMargin={true}
            allowCustomMargin={config.allowCustomMargin}
          />
        </div>
      </div>
    </div>
  );
}
