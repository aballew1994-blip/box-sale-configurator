"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";

interface ScopeOfWorkTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

const SCOPE_FIELDS = [
  {
    key: "installationScope",
    label: "Installation Scope",
    placeholder: "Describe the installation scope...",
  },
  {
    key: "customerProvidedScope",
    label: "Customer Provided Equipment & Services",
    placeholder: "List equipment and services provided by the customer...",
  },
  {
    key: "proServicesScope",
    label: "Professional Services Scope",
    placeholder: "Describe the professional services scope...",
  },
  {
    key: "solutionsArchitectScope",
    label: "Solutions Architect Scope",
    placeholder: "Describe the solutions architect scope...",
  },
  {
    key: "constraintsAssumptions",
    label: "Constraints & Assumptions",
    placeholder: "List any constraints and assumptions...",
  },
  {
    key: "exclusions",
    label: "Exclusions",
    placeholder: "List any exclusions from the project scope...",
  },
  {
    key: "focusScope",
    label: "FOCUS Scope",
    placeholder: "Describe the FOCUS scope...",
  },
];

export function ScopeOfWorkTab({ config, onConfigUpdate }: ScopeOfWorkTabProps) {
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string | null) => {
      mutation.mutate({ [field]: value });
    },
    [mutation]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Scope of Work</h3>
          <p className="text-sm text-muted-foreground">Detailed project scope documentation</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5 space-y-6">
        {SCOPE_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {field.label}
            </label>
            <textarea
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none min-h-[120px] resize-y"
              placeholder={field.placeholder}
              defaultValue={config[field.key as keyof ProjectConfiguration] as string || ""}
              onBlur={(e) => saveField(field.key, e.target.value || null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
