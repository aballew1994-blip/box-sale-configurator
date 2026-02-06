"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface AcsCardDetailsProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

export function AcsCardDetails({ config, onConfigUpdate }: AcsCardDetailsProps) {
  const [format, setFormat] = useState(config.acsFormat || "");
  const [facilityCode, setFacilityCode] = useState(config.acsFacilityCode || "");
  const [quantity, setQuantity] = useState(String(config.acsQuantity ?? ""));
  const [startNumber, setStartNumber] = useState(String(config.acsStartNumber ?? ""));
  const [endNumber, setEndNumber] = useState(String(config.acsEndNumber ?? ""));

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string | number | null) => {
      mutation.mutate({ [field]: value });
    },
    [config.id]
  );

  const inputClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none";

  return (
    <div className="pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        ACS Card Details
      </h4>
      <div className="grid grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Format
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            onBlur={() => saveField("acsFormat", format || null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Facility Code
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Facility Code"
            value={facilityCode}
            onChange={(e) => setFacilityCode(e.target.value)}
            onBlur={() => saveField("acsFacilityCode", facilityCode || null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Quantity
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => {
              const v = parseInt(quantity);
              saveField("acsQuantity", isNaN(v) ? null : v);
            }}
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Start Number
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="Start #"
            value={startNumber}
            onChange={(e) => setStartNumber(e.target.value)}
            onBlur={() => {
              const v = parseInt(startNumber);
              saveField("acsStartNumber", isNaN(v) ? null : v);
            }}
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            End Number
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="End #"
            value={endNumber}
            onChange={(e) => setEndNumber(e.target.value)}
            onBlur={() => {
              const v = parseInt(endNumber);
              saveField("acsEndNumber", isNaN(v) ? null : v);
            }}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
