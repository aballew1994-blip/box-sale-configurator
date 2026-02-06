"use client";

import type { ProjectConfiguration } from "@/lib/api-client";
import type { ProjectSummaryComputed } from "@/lib/utils/projectCalculations";

interface ProjectSummaryPanelProps {
  summary: ProjectSummaryComputed;
  config: ProjectConfiguration;
}

export function ProjectSummaryPanel({ summary, config }: ProjectSummaryPanelProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const statusBadge = () => {
    switch (config.status) {
      case "SUBMITTED":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Submitted
          </span>
        );
      case "ERROR":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="sticky top-20">
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
        {/* Header with Status */}
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Pricing Summary</h3>
          {statusBadge()}
        </div>

        {/* Summary Rows */}
        <div className="p-5 space-y-3">
          {/* Materials */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Materials</span>
            <span className="font-medium text-foreground">{fmt(summary.materials)}</span>
          </div>

          {/* Subcontractor Materials */}
          {summary.subcontractorMaterials > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subcontractor Materials</span>
              <span className="font-medium text-foreground">
                {fmt(summary.subcontractorMaterials)}
              </span>
            </div>
          )}

          {/* Labor */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Labor</span>
            <span className="font-medium text-foreground">{fmt(summary.labor)}</span>
          </div>

          {/* Subcontractor Labor */}
          {summary.subcontractorLabor > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subcontractor Labor</span>
              <span className="font-medium text-foreground">
                {fmt(summary.subcontractorLabor)}
              </span>
            </div>
          )}

          {/* Indirect Cost */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Indirect Cost
              {!config.indirectCostOverride && (
                <span className="text-xs ml-1">(15%)</span>
              )}
            </span>
            <span className="font-medium text-foreground">
              {fmt(summary.indirectCost)}
            </span>
          </div>

          {/* FOCUS (if included) */}
          {summary.focusAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">FOCUS</span>
              <span className="font-medium text-foreground">
                {fmt(summary.focusAmount)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border/50 my-3" />

          {/* Grand Total */}
          <div className="flex justify-between">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">{fmt(summary.total)}</span>
          </div>
        </div>

        {/* Item Counts */}
        <div className="px-5 py-3 bg-secondary/30 border-t border-border/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>TSI Parts: {summary.tsiPartsCount}</span>
            <span>Sub Parts: {summary.subPartsCount}</span>
            <span>Labor Items: {summary.laborItemsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
