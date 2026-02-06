"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface LicensingDetailsProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

export function LicensingDetails({ config, onConfigUpdate }: LicensingDetailsProps) {
  const [systemId, setSystemId] = useState(config.systemId || "");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string | null) => {
      mutation.mutate({ [field]: value });
    },
    [config.id]
  );

  return (
    <div className="pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Licensing & SSA Details
      </h4>
      <div className="max-w-md">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          System ID
        </label>
        <input
          type="text"
          className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none"
          placeholder="Enter System ID"
          value={systemId}
          onChange={(e) => setSystemId(e.target.value)}
          onBlur={() => saveField("systemId", systemId || null)}
        />
      </div>
    </div>
  );
}
