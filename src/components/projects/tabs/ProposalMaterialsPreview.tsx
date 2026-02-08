"use client";

import type { ProjectConfiguration } from "@/lib/api-client";
import { Card } from "@/components/ui";

interface ProposalMaterialsPreviewProps {
  config: ProjectConfiguration;
}

const CATEGORY_LABELS: Record<string, string> = {
  TSI_PROVIDED_PARTS: "TSI Materials",
  SUBCONTRACTOR_PARTS: "Subcontractor Materials",
  INSTALLATION_LABOR: "Installation Labor",
  SUBCONTRACTOR_LABOR: "Subcontractor Labor",
  PROJECT_MANAGEMENT: "Project Management",
  MISC_LABOR: "Miscellaneous Labor",
  TRAVEL_COSTS: "Travel Costs",
};

const MATERIAL_CATEGORIES = ["TSI_PROVIDED_PARTS", "SUBCONTRACTOR_PARTS"];
const LABOR_CATEGORIES = [
  "INSTALLATION_LABOR",
  "SUBCONTRACTOR_LABOR",
  "PROJECT_MANAGEMENT",
  "MISC_LABOR",
  "TRAVEL_COSTS",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function ProposalMaterialsPreview({ config }: ProposalMaterialsPreviewProps) {
  const lineItems = config.lineItems || [];
  const locations = config.locations || [];

  // Group materials by location
  const materialsByLocation = new Map<string, { name: string; total: number; count: number }>();
  let unassignedMaterialsTotal = 0;
  let unassignedMaterialsCount = 0;

  lineItems
    .filter((item) => MATERIAL_CATEGORIES.includes(item.category))
    .forEach((item) => {
      const total = Number(item.totalPrice);
      if (item.locationId) {
        const location = locations.find((l) => l.id === item.locationId);
        if (location) {
          const existing = materialsByLocation.get(item.locationId);
          if (existing) {
            existing.total += total;
            existing.count += 1;
          } else {
            materialsByLocation.set(item.locationId, { name: location.name, total, count: 1 });
          }
        } else {
          unassignedMaterialsTotal += total;
          unassignedMaterialsCount += 1;
        }
      } else {
        unassignedMaterialsTotal += total;
        unassignedMaterialsCount += 1;
      }
    });

  // Calculate labor totals by category
  const laborByCategory = new Map<string, { total: number; count: number }>();
  lineItems
    .filter((item) => LABOR_CATEGORIES.includes(item.category))
    .forEach((item) => {
      const total = Number(item.totalPrice);
      const existing = laborByCategory.get(item.category);
      if (existing) {
        existing.total += total;
        existing.count += 1;
      } else {
        laborByCategory.set(item.category, { total, count: 1 });
      }
    });

  const materialsTotal = lineItems
    .filter((item) => MATERIAL_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const laborTotal = lineItems
    .filter((item) => LABOR_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const tariffTotal = lineItems.reduce((sum, item) => sum + Number(item.tariffAmount), 0);

  const grandTotal = materialsTotal + laborTotal + Number(config.indirectCost);

  const hasMaterials = lineItems.some((item) => MATERIAL_CATEGORIES.includes(item.category));
  const hasLabor = lineItems.some((item) => LABOR_CATEGORIES.includes(item.category));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-info-bg flex items-center justify-center">
            <svg className="w-4 h-4 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground">Proposal Summary</h3>
        </div>
        <span className="text-lg font-bold text-primary">{formatCurrency(grandTotal)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Materials Section */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
            <span>Materials by Location</span>
            <span className="text-xs text-muted-foreground">{formatCurrency(materialsTotal)}</span>
          </h4>

          {hasMaterials ? (
            <div className="space-y-2">
              {Array.from(materialsByLocation.entries())
                .sort((a, b) => {
                  const locA = locations.find((l) => l.id === a[0]);
                  const locB = locations.find((l) => l.id === b[0]);
                  return (locA?.sortOrder || 0) - (locB?.sortOrder || 0);
                })
                .map(([locationId, data]) => (
                  <div key={locationId} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {data.name}
                      <span className="text-xs ml-1">({data.count} items)</span>
                    </span>
                    <span className="font-medium">{formatCurrency(data.total)}</span>
                  </div>
                ))}

              {unassignedMaterialsCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Unassigned
                    <span className="text-xs ml-1">({unassignedMaterialsCount} items)</span>
                  </span>
                  <span className="font-medium">{formatCurrency(unassignedMaterialsTotal)}</span>
                </div>
              )}

              {tariffTotal > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">Tariff Total</span>
                  <span className="font-medium">{formatCurrency(tariffTotal)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              No materials added. Go to the Materials tab to add items.
            </p>
          )}
        </div>

        {/* Labor Section */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
            <span>Labor Summary</span>
            <span className="text-xs text-muted-foreground">{formatCurrency(laborTotal)}</span>
          </h4>

          {hasLabor ? (
            <div className="space-y-2">
              {Array.from(laborByCategory.entries()).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {CATEGORY_LABELS[category] || category}
                    <span className="text-xs ml-1">({data.count} items)</span>
                  </span>
                  <span className="font-medium">{formatCurrency(data.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              No labor added. Go to the Labor tab to add items.
            </p>
          )}

          {Number(config.indirectCost) > 0 && (
            <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-border/30">
              <span className="text-muted-foreground">Indirect Costs</span>
              <span className="font-medium">{formatCurrency(Number(config.indirectCost))}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Edit materials and labor in their respective tabs. The proposal PDF will show materials grouped by location.
      </p>
    </Card>
  );
}
