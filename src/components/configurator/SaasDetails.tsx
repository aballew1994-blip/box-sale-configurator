"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface SaasDetailsProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

const TERM_OPTIONS = [
  { value: 1, label: "1 Year" },
  { value: 2, label: "2 Years" },
  { value: 3, label: "3 Years" },
  { value: 4, label: "4 Years" },
  { value: 5, label: "5 Years" },
];

const BILLING_OPTIONS = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "other", label: "Other" },
];

export function SaasDetails({ config, onConfigUpdate }: SaasDetailsProps) {
  const [startDate, setStartDate] = useState(config.saasStartDate || "");
  const [endDate, setEndDate] = useState(config.saasEndDate || "");
  const [notes, setNotes] = useState(config.saasEffectiveDateNotes || "");

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

  const pillBase =
    "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer";
  const pillSelected = "bg-primary text-white shadow-sm";
  const pillUnselected =
    "bg-secondary text-foreground hover:bg-secondary/80";

  return (
    <div className="pt-4 space-y-6">
      {/* SaaS Term */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          SaaS Term
        </h4>
        <div className="flex flex-wrap gap-2">
          {TERM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${pillBase} ${config.saasTerm === opt.value ? pillSelected : pillUnselected}`}
              onClick={() => saveField("saasTerm", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Effective Dates */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Effective Dates
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={() => saveField("saasStartDate", startDate || null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              End Date
            </label>
            <input
              type="date"
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={() => saveField("saasEndDate", endDate || null)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes
            </label>
            <input
              type="text"
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none"
              placeholder="Effective date notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveField("saasEffectiveDateNotes", notes || null)}
            />
          </div>
        </div>
      </div>

      {/* Billing Schedule */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Billing Schedule
        </h4>
        <div className="flex flex-wrap gap-2">
          {BILLING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${pillBase} ${config.saasBillingSchedule === opt.value ? pillSelected : pillUnselected}`}
              onClick={() => saveField("saasBillingSchedule", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
