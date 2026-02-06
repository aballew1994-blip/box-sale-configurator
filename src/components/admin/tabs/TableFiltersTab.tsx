"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTableFilterConfigs,
  updateTableFilterConfig,
  type TableFilterConfig,
} from "@/lib/api-client";

const ITEM_TYPES = [
  { value: "inventoryItem", label: "Inventory Item" },
  { value: "nonInventoryItem", label: "Non-Inventory Item" },
  { value: "serviceItem", label: "Service Item" },
];

export function TableFiltersTab() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tableFilterConfigs"],
    queryFn: async () => {
      const result = await getTableFilterConfigs();
      return result.configs;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading table filters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load table filters
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Table Filters</h2>
        <p className="text-sm text-muted-foreground">
          Configure which items appear in each parts/labor table based on item
          type, name patterns, and other criteria.
        </p>
      </div>

      <div className="grid gap-4">
        {data?.map((config) => (
          <TableFilterCard
            key={config.id}
            config={config}
            onUpdate={() =>
              queryClient.invalidateQueries({ queryKey: ["tableFilterConfigs"] })
            }
          />
        ))}
      </div>
    </div>
  );
}

interface TableFilterCardProps {
  config: TableFilterConfig;
  onUpdate: () => void;
}

function TableFilterCard({ config, onUpdate }: TableFilterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(config.filters);
  const [nameContainsInput, setNameContainsInput] = useState("");
  const [nameExcludesInput, setNameExcludesInput] = useState("");

  const updateMutation = useMutation({
    mutationFn: (filters: TableFilterConfig["filters"]) =>
      updateTableFilterConfig(config.tableKey, { filters }),
    onSuccess: () => {
      onUpdate();
    },
  });

  const handleItemTypeToggle = (itemType: string) => {
    const current = localFilters.itemTypes || [];
    const updated = current.includes(itemType)
      ? current.filter((t) => t !== itemType)
      : [...current, itemType];

    const newFilters = { ...localFilters, itemTypes: updated };
    setLocalFilters(newFilters);
    updateMutation.mutate(newFilters);
  };

  const handleAddNameContains = () => {
    if (!nameContainsInput.trim()) return;
    const current = localFilters.nameContains || [];
    if (current.includes(nameContainsInput.trim())) return;

    const newFilters = {
      ...localFilters,
      nameContains: [...current, nameContainsInput.trim()],
    };
    setLocalFilters(newFilters);
    updateMutation.mutate(newFilters);
    setNameContainsInput("");
  };

  const handleRemoveNameContains = (pattern: string) => {
    const current = localFilters.nameContains || [];
    const newFilters = {
      ...localFilters,
      nameContains: current.filter((p) => p !== pattern),
    };
    setLocalFilters(newFilters);
    updateMutation.mutate(newFilters);
  };

  const handleAddNameExcludes = () => {
    if (!nameExcludesInput.trim()) return;
    const current = localFilters.nameExcludes || [];
    if (current.includes(nameExcludesInput.trim())) return;

    const newFilters = {
      ...localFilters,
      nameExcludes: [...current, nameExcludesInput.trim()],
    };
    setLocalFilters(newFilters);
    updateMutation.mutate(newFilters);
    setNameExcludesInput("");
  };

  const handleRemoveNameExcludes = (pattern: string) => {
    const current = localFilters.nameExcludes || [];
    const newFilters = {
      ...localFilters,
      nameExcludes: current.filter((p) => p !== pattern),
    };
    setLocalFilters(newFilters);
    updateMutation.mutate(newFilters);
  };

  return (
    <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">
              {config.displayName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {config.description || config.tableKey}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {updateMutation.isPending && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-border/30 space-y-5">
          {/* Item Types */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Item Types
            </label>
            <div className="flex flex-wrap gap-2">
              {ITEM_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.itemTypes?.includes(type.value) || false}
                    onChange={() => handleItemTypeToggle(type.value)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name Contains */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name Contains (any of these patterns)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nameContainsInput}
                onChange={(e) => setNameContainsInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNameContains()}
                placeholder="Enter pattern..."
                className="flex-1 px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddNameContains}
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.nameContains?.map((pattern) => (
                <span
                  key={pattern}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-accent/50 rounded-full"
                >
                  {pattern}
                  <button
                    onClick={() => handleRemoveNameContains(pattern)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
              {(!localFilters.nameContains ||
                localFilters.nameContains.length === 0) && (
                <span className="text-xs text-muted-foreground">
                  No patterns set (all names allowed)
                </span>
              )}
            </div>
          </div>

          {/* Name Excludes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name Excludes (none of these patterns)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nameExcludesInput}
                onChange={(e) => setNameExcludesInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNameExcludes()}
                placeholder="Enter pattern to exclude..."
                className="flex-1 px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddNameExcludes}
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.nameExcludes?.map((pattern) => (
                <span
                  key={pattern}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-destructive/10 text-destructive rounded-full"
                >
                  {pattern}
                  <button
                    onClick={() => handleRemoveNameExcludes(pattern)}
                    className="hover:text-destructive/70"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
              {(!localFilters.nameExcludes ||
                localFilters.nameExcludes.length === 0) && (
                <span className="text-xs text-muted-foreground">
                  No exclusions set
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
