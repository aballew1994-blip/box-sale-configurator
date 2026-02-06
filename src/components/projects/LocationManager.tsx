"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  createProjectLocation,
  deleteProjectLocation,
  getProjectConfiguration,
} from "@/lib/api-client";
import type { ProjectConfiguration, ProjectLocation } from "@/lib/api-client";

interface LocationManagerProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function LocationManager({
  config,
  onConfigUpdate,
}: LocationManagerProps) {
  const [newLocationName, setNewLocationName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const refreshConfig = async () => {
    const data = await getProjectConfiguration(config.id);
    onConfigUpdate(data.configuration);
  };

  const createMutation = useMutation({
    mutationFn: (name: string) => createProjectLocation(config.id, name),
    onSuccess: () => {
      refreshConfig();
      setNewLocationName("");
      setIsAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (locationId: string) =>
      deleteProjectLocation(config.id, locationId),
    onSuccess: refreshConfig,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      createMutation.mutate(newLocationName.trim());
    }
  };

  return (
    <div className="bg-secondary/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Locations</h4>
        {!isAdding && (
          <button
            className="text-xs text-primary hover:text-primary/80 font-medium"
            onClick={() => setIsAdding(true)}
          >
            + Add Location
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Location name..."
            className="flex-1 px-3 py-1.5 text-sm bg-white border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={!newLocationName.trim() || createMutation.isPending}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewLocationName("");
            }}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </form>
      )}

      {config.locations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No locations defined. Add locations to organize parts by area.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {config.locations.map((loc) => (
            <LocationTag
              key={loc.id}
              location={loc}
              onDelete={() => deleteMutation.mutate(loc.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LocationTagProps {
  location: ProjectLocation;
  onDelete: () => void;
  isDeleting: boolean;
}

function LocationTag({ location, onDelete, isDeleting }: LocationTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-border/50 rounded-full">
      <span className="text-foreground">{location.name}</span>
      <button
        className="text-muted-foreground hover:text-destructive transition-colors"
        onClick={onDelete}
        disabled={isDeleting}
        title="Remove location"
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
  );
}
