"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";
import { AcsCardDetails } from "./AcsCardDetails";
import { LicensingDetails } from "./LicensingDetails";
import { SaasDetails } from "./SaasDetails";

interface ConfigFlagsProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${checked ? "bg-primary" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0.5"}
          mt-0.5
        `}
      />
    </button>
  );
}

const FLAGS = [
  {
    key: "accessControlCards" as const,
    label: "Access Control Cards",
    description: "Include ACS card configuration details",
  },
  {
    key: "allowCustomMargin" as const,
    label: "Allow Custom Margin",
    description: "Enable per-line product price overrides",
  },
  {
    key: "licensingSSA" as const,
    label: "Licensing & SSA",
    description: "Add licensing and software assurance",
  },
  {
    key: "saas" as const,
    label: "SaaS",
    description: "Configure SaaS terms and billing",
  },
];

export function ConfigFlags({ config, onConfigUpdate }: ConfigFlagsProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: (data) => {
      onConfigUpdate(data.configuration);
      queryClient.invalidateQueries({
        queryKey: ["configuration", config.id],
      });
    },
  });

  const handleChange = (field: string, value: boolean) => {
    mutation.mutate({ [field]: value });
  };

  return (
    <div className={mounted ? "" : "no-transition"}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Configuration Options
          </h3>
          <p className="text-sm text-muted-foreground">
            Enable features and configure project settings
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm">
        <div className="divide-y divide-border/30">
          {FLAGS.map((flag) => (
            <div
              key={flag.key}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {flag.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {flag.description}
                </div>
              </div>
              <ToggleSwitch
                checked={config[flag.key]}
                onChange={(v) => handleChange(flag.key, v)}
              />
            </div>
          ))}
        </div>

        {/* Conditional: ACS Card Details */}
        <div
          className={`collapsible-grid ${config.accessControlCards ? "open" : ""}`}
        >
          <div>
            <div className="px-5 pb-5">
              <AcsCardDetails
                config={config}
                onConfigUpdate={onConfigUpdate}
              />
            </div>
          </div>
        </div>

        {/* Conditional: Licensing & SSA */}
        <div
          className={`collapsible-grid ${config.licensingSSA ? "open" : ""}`}
        >
          <div>
            <div className="px-5 pb-5">
              <LicensingDetails
                config={config}
                onConfigUpdate={onConfigUpdate}
              />
            </div>
          </div>
        </div>

        {/* Conditional: SaaS */}
        <div className={`collapsible-grid ${config.saas ? "open" : ""}`}>
          <div>
            <div className="px-5 pb-5">
              <SaasDetails
                config={config}
                onConfigUpdate={onConfigUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
