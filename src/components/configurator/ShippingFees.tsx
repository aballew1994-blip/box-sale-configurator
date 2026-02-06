"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration, getConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";
import type { ConfigSummaryComputed } from "@/lib/utils/calculations";

interface ShippingFeesProps {
  config: Configuration;
  summary: ConfigSummaryComputed;
  onConfigUpdate: (config: Configuration) => void;
}

export function ShippingFees({
  config,
  summary,
  onConfigUpdate,
}: ShippingFeesProps) {
  const [shippingValue, setShippingValue] = useState(
    String(Number(config.shippingFee) || summary.shippingFee)
  );

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: async () => {
      const refreshed = await getConfiguration(config.id);
      onConfigUpdate(refreshed.configuration);
    },
  });

  const handleOverride = () => {
    const val = parseFloat(shippingValue);
    if (isNaN(val) || val < 0) return;
    mutation.mutate({
      shippingFee: val,
      shippingOverride: true,
    });
  };

  const handleClear = () => {
    mutation.mutate({
      shippingFee: summary.shippingFee,
      shippingOverride: false,
    });
    setShippingValue(String(summary.shippingFee));
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
        Shipping Fees
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-2">
          Default 5% of Equipment Cost
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-24 px-2 py-1 border rounded text-sm text-right"
            value={shippingValue}
            onChange={(e) => setShippingValue(e.target.value)}
            onBlur={handleOverride}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            step="0.01"
            min="0"
          />
          {config.shippingOverride && (
            <button
              className="text-muted-foreground hover:text-foreground text-lg"
              onClick={handleClear}
              title="Reset to default"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
