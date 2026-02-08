"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getManufacturerTariffs,
  createManufacturerTariff,
  updateManufacturerTariff,
  deleteManufacturerTariff,
  type ManufacturerTariff,
} from "@/lib/api-client";

export function TariffMaintenanceTab() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["manufacturerTariffs"],
    queryFn: async () => {
      const result = await getManufacturerTariffs();
      return result.tariffs;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading manufacturer tariffs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load manufacturer tariffs
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Tariff Maintenance
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure tariff percentages by manufacturer. When parts are added
            to a configuration, the tariff will be automatically applied based
            on the manufacturer.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Manufacturer
        </button>
      </div>

      {showAddForm && (
        <AddTariffForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            queryClient.invalidateQueries({ queryKey: ["manufacturerTariffs"] });
          }}
        />
      )}

      {data && data.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1">
            No tariffs configured
          </h3>
          <p className="text-xs text-muted-foreground">
            Add manufacturer tariffs to automatically apply tariff percentages
            when adding parts.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tariff %
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  NetSuite Item
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data?.map((tariff) => (
                <TariffRow
                  key={tariff.id}
                  tariff={tariff}
                  onUpdate={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["manufacturerTariffs"],
                    })
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface AddTariffFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddTariffForm({ onClose, onSuccess }: AddTariffFormProps) {
  const [manufacturer, setManufacturer] = useState("");
  const [tariffPercent, setTariffPercent] = useState("");
  const [netsuiteItemId, setNetsuiteItemId] = useState("");
  const [netsuiteItemNumber, setNetsuiteItemNumber] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createManufacturerTariff,
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!manufacturer.trim()) {
      setError("Manufacturer name is required");
      return;
    }

    const percent = parseFloat(tariffPercent);
    if (isNaN(percent) || percent < 0 || percent > 99.99) {
      setError("Tariff percentage must be between 0 and 99.99");
      return;
    }

    createMutation.mutate({
      manufacturer: manufacturer.trim(),
      tariffPercent: percent,
      netsuiteItemId: netsuiteItemId.trim() || null,
      netsuiteItemNumber: netsuiteItemNumber.trim() || null,
    });
  };

  return (
    <div className="bg-surface rounded-xl border border-border/50 p-5 mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Add Manufacturer Tariff
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Manufacturer Name *
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g., Axis Communications"
              className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tariff Percentage *
            </label>
            <input
              type="number"
              value={tariffPercent}
              onChange={(e) => setTariffPercent(e.target.value)}
              placeholder="e.g., 7.5"
              min="0"
              max="99.99"
              step="0.01"
              className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              NetSuite Item ID
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={netsuiteItemId}
              onChange={(e) => setNetsuiteItemId(e.target.value)}
              placeholder="NetSuite internal ID"
              className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              NetSuite Item Number
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={netsuiteItemNumber}
              onChange={(e) => setNetsuiteItemNumber(e.target.value)}
              placeholder="e.g., TARIFF-AXIS"
              className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? "Adding..." : "Add Tariff"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface TariffRowProps {
  tariff: ManufacturerTariff;
  onUpdate: () => void;
}

function TariffRow({ tariff, onUpdate }: TariffRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPercent, setEditPercent] = useState(String(tariff.tariffPercent));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateManufacturerTariff>[1]) =>
      updateManufacturerTariff(tariff.id, data),
    onSuccess: () => {
      onUpdate();
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteManufacturerTariff(tariff.id),
    onSuccess: () => {
      onUpdate();
    },
  });

  const handlePercentBlur = () => {
    const percent = parseFloat(editPercent);
    if (!isNaN(percent) && percent >= 0 && percent <= 99.99) {
      if (percent !== Number(tariff.tariffPercent)) {
        updateMutation.mutate({ tariffPercent: percent });
      } else {
        setIsEditing(false);
      }
    } else {
      setEditPercent(String(tariff.tariffPercent));
      setIsEditing(false);
    }
  };

  const handleToggleEnabled = () => {
    updateMutation.mutate({ isEnabled: !tariff.isEnabled });
  };

  return (
    <tr className={`hover:bg-secondary/20 transition-colors ${!tariff.isEnabled ? "opacity-50" : ""}`}>
      <td className="px-5 py-4">
        <span className="text-sm font-medium text-foreground">
          {tariff.manufacturer}
        </span>
      </td>
      <td className="px-5 py-4">
        {isEditing ? (
          <input
            type="number"
            value={editPercent}
            onChange={(e) => setEditPercent(e.target.value)}
            onBlur={handlePercentBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePercentBlur();
              if (e.key === "Escape") {
                setEditPercent(String(tariff.tariffPercent));
                setIsEditing(false);
              }
            }}
            min="0"
            max="99.99"
            step="0.01"
            autoFocus
            className="w-20 px-2 py-1 text-sm bg-secondary/50 border border-primary/50 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            {Number(tariff.tariffPercent).toFixed(2)}%
          </button>
        )}
        {updateMutation.isPending && (
          <span className="ml-2 text-xs text-muted-foreground">Saving...</span>
        )}
      </td>
      <td className="px-5 py-4">
        {tariff.netsuiteItemNumber ? (
          <span className="text-sm text-foreground">
            {tariff.netsuiteItemNumber}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">Not mapped</span>
        )}
      </td>
      <td className="px-5 py-4">
        <button
          onClick={handleToggleEnabled}
          disabled={updateMutation.isPending}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            tariff.isEnabled
              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
              : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
          }`}
        >
          {tariff.isEnabled ? "Enabled" : "Disabled"}
        </button>
      </td>
      <td className="px-5 py-4 text-right">
        {showDeleteConfirm ? (
          <div className="inline-flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Delete?</span>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-xs text-destructive hover:text-destructive/80"
            >
              {deleteMutation.isPending ? "..." : "Yes"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}
