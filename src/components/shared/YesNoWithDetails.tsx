"use client";

import { useState, useEffect } from "react";
import { ToggleSwitch } from "./ToggleSwitch";

interface YesNoWithDetailsProps {
  label: string;
  description?: string;
  checked: boolean;
  details?: string | null;
  onCheckedChange: (checked: boolean) => void;
  onDetailsChange?: (details: string) => void;
  detailsPlaceholder?: string;
}

export function YesNoWithDetails({
  label,
  description,
  checked,
  details,
  onCheckedChange,
  onDetailsChange,
  detailsPlaceholder = "Enter details...",
}: YesNoWithDetailsProps) {
  const [localDetails, setLocalDetails] = useState(details || "");

  useEffect(() => {
    setLocalDetails(details || "");
  }, [details]);

  return (
    <div>
      <div className="flex items-center justify-between py-3">
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {description}
            </div>
          )}
        </div>
        <ToggleSwitch checked={checked} onChange={onCheckedChange} />
      </div>

      {/* Collapsible details section */}
      <div
        className={`collapsible-grid ${checked && onDetailsChange ? "open" : ""}`}
      >
        <div>
          <div className="pb-3">
            <textarea
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none min-h-[80px] resize-y"
              placeholder={detailsPlaceholder}
              value={localDetails}
              onChange={(e) => setLocalDetails(e.target.value)}
              onBlur={() => onDetailsChange?.(localDetails)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
