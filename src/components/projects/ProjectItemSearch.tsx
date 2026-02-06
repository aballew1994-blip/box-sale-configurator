"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  searchItemsWithFilters,
  addProjectLineItem,
  getProjectConfiguration,
} from "@/lib/api-client";
import type { ProjectConfiguration, ProjectLineCategory } from "@/lib/api-client";

interface ProjectItemSearchProps {
  configId: string;
  category: ProjectLineCategory;
  onItemAdded: (config: ProjectConfiguration) => void;
  placeholder?: string;
}

export function ProjectItemSearch({
  configId,
  category,
  onItemAdded,
  placeholder = "Search by part #, name, or manufacturer...",
}: ProjectItemSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["itemSearch", debouncedQuery, category],
    queryFn: () => searchItemsWithFilters(debouncedQuery, category),
    enabled: debouncedQuery.length >= 2,
  });

  const addMutation = useMutation({
    mutationFn: (item: {
      internalId: string;
      itemId: string;
      manufacturer: string;
      description: string;
      cost: number;
    }) =>
      addProjectLineItem(configId, {
        category,
        itemId: item.internalId,
        partNumber: item.itemId,
        manufacturer: item.manufacturer,
        description: item.description,
        quantity: 1,
        unitCost: item.cost,
      }),
    onSuccess: async () => {
      const refreshed = await getProjectConfiguration(configId);
      onItemAdded(refreshed.configuration);
      setQuery("");
      setShowResults(false);
    },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2.5 bg-secondary/50 border-0 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => debouncedQuery.length >= 2 && setShowResults(true)}
        />
      </div>

      {showResults && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl border border-border/50 shadow-xl max-h-80 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          ) : data?.items && data.items.length > 0 ? (
            data.items.map((item) => (
              <button
                key={item.internalId}
                className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-border/20 last:border-b-0 transition-colors"
                onClick={() => addMutation.mutate(item)}
                disabled={addMutation.isPending}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {item.itemId}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.manufacturer}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {fmt(item.cost)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.description || item.displayName}
                </p>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No items found for &quot;{debouncedQuery}&quot;
            </div>
          )}
        </div>
      )}

      {addMutation.isError && (
        <p className="text-xs text-destructive mt-1">
          Failed to add item: {addMutation.error.message}
        </p>
      )}
    </div>
  );
}
