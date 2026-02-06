"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration, getConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";
import type { ConfigSummaryComputed } from "@/lib/utils/calculations";

interface SummaryPanelProps {
  summary: ConfigSummaryComputed;
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

export function SummaryPanel({ summary, config, onConfigUpdate }: SummaryPanelProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const marginPct = (summary.overallMargin * 100).toFixed(1);
  const marginColor =
    summary.overallMargin >= 0.3
      ? "text-green-700"
      : summary.overallMargin >= 0.2
        ? "text-yellow-600"
        : "text-red-600";

  const statusBadge = () => {
    switch (config.status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Submitted
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sticky top-20">
      {/* Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </h3>
        {statusBadge()}
      </div>

      {/* Validation */}
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
        {config.lineItems.length === 0 ? (
          <div className="border-l-4 border-amber-400 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Add items to see validation messages.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`border-l-4 px-4 py-3 ${
                summary.overallMargin >= 0.3
                  ? "border-green-500"
                  : summary.overallMargin >= 0.2
                    ? "border-yellow-500"
                    : "border-red-500"
              }`}
            >
              <p className="text-xs text-muted-foreground mb-0.5">Overall Margin</p>
              <p className={`text-sm font-semibold ${marginColor}`}>{marginPct}%</p>
            </div>
          </>
        )}

        {config.status === "SUBMITTED" && (
          <div className="border-l-4 border-green-500 px-4 py-3 border-t border-border/30">
            <p className="text-sm text-green-700">Successfully submitted to NetSuite.</p>
          </div>
        )}

        {config.status === "ERROR" && (
          <div className="border-l-4 border-red-500 px-4 py-3 border-t border-border/30">
            <p className="text-sm text-destructive">Submission failed. Check the error log and retry.</p>
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border/30">
              <td className="py-2.5 text-muted-foreground">Total Price</td>
              <td className="py-2.5 text-right font-medium">${fmt(summary.totalPrice)}</td>
            </tr>
            <ShippingRow
              config={config}
              summary={summary}
              onConfigUpdate={onConfigUpdate}
              fmt={fmt}
            />
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border/50">
              <td className="pt-4 pb-1 text-base font-bold text-foreground">Subtotal</td>
              <td className="pt-4 pb-1 text-right text-lg font-bold text-foreground">
                ${fmt(summary.subtotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground space-y-1.5 px-1">
        <div className="flex justify-between">
          <span>Items</span>
          <span className="font-medium text-foreground">{summary.lineCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Version</span>
          <span className="font-medium text-foreground">{config.version}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Shipping Row ─────────────────────────────────────────────── */

interface ShippingRowProps {
  config: Configuration;
  summary: ConfigSummaryComputed;
  onConfigUpdate: (config: Configuration) => void;
  fmt: (n: number) => string;
}

function ShippingRow({ config, summary, onConfigUpdate, fmt }: ShippingRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Number(config.shippingFee) || summary.shippingFee));

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: async () => {
      const refreshed = await getConfiguration(config.id);
      onConfigUpdate(refreshed.configuration);
    },
  });

  const handleSave = () => {
    setEditing(false);
    const val = parseFloat(value);
    if (isNaN(val) || val < 0) {
      setValue(String(Number(config.shippingFee) || summary.shippingFee));
      return;
    }
    mutation.mutate({ shippingFee: val, shippingOverride: true });
  };

  const handleReset = () => {
    mutation.mutate({ shippingFee: summary.shippingFee, shippingOverride: false });
    setValue(String(summary.shippingFee));
  };

  return (
    <tr className="border-b border-border/30">
      <td className="py-2.5 text-muted-foreground">
        <span>Shipping</span>
        <span className="text-xs text-muted-foreground/60 ml-1">(5%)</span>
        {config.shippingOverride && (
          <button
            className="ml-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            onClick={handleReset}
            title="Reset to default"
          >
            reset
          </button>
        )}
      </td>
      <td className="py-2.5 text-right">
        {editing ? (
          <input
            type="number"
            className="w-24 px-2 py-0.5 border border-primary/30 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setValue(String(Number(config.shippingFee) || summary.shippingFee));
                setEditing(false);
              }
            }}
            autoFocus
            step="0.01"
            min="0"
          />
        ) : (
          <button
            className="font-medium border-b border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-colors"
            onClick={() => setEditing(true)}
          >
            ${fmt(Number(config.shippingFee) || summary.shippingFee)}
          </button>
        )}
      </td>
    </tr>
  );
}
