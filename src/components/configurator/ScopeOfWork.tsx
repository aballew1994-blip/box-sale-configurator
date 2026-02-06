"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface ScopeOfWorkProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

export function ScopeOfWork({ config, onConfigUpdate }: ScopeOfWorkProps) {
  const [summary, setSummary] = useState(config.proposalSummary || "");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string) => {
      mutation.mutate({ [field]: value });
    },
    [config.id]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Scope of Work
          </h3>
          <p className="text-sm text-muted-foreground">
            Describe the project scope and deliverables
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Proposal Summary
        </label>
        <textarea
          className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none min-h-[160px] resize-y"
          placeholder="Enter proposal summary / scope of work..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          onBlur={() => saveField("proposalSummary", summary)}
        />
      </div>
    </div>
  );
}
