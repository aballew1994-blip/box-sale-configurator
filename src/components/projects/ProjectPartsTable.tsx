"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  updateProjectLineItem,
  deleteProjectLineItem,
  getProjectConfiguration,
} from "@/lib/api-client";
import type {
  ProjectConfiguration,
  ProjectLineItem,
  ProjectLocation,
  ProjectLineCategory,
} from "@/lib/api-client";

interface ProjectPartsTableProps {
  config: ProjectConfiguration;
  category: ProjectLineCategory;
  onConfigUpdate: (config: ProjectConfiguration) => void;
  showLocation?: boolean;
  showTariff?: boolean;
  showMargin?: boolean;
  allowCustomMargin?: boolean;
  allowPriceEdit?: boolean;
}

export function ProjectPartsTable({
  config,
  category,
  onConfigUpdate,
  showLocation = false,
  showTariff = false,
  showMargin = false,
  allowCustomMargin = false,
  allowPriceEdit,
}: ProjectPartsTableProps) {
  // allowPriceEdit defaults to allowCustomMargin if not specified
  const canEditPrice = allowPriceEdit ?? allowCustomMargin;
  const items = config.lineItems.filter((li) => li.category === category);

  const fmt = (n: number | string) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(n));

  const pctFmt = (n: number | string) => {
    const val = Number(n);
    return val > 0 ? (val * 100).toFixed(1) : "0";
  };

  const refreshConfig = async () => {
    const data = await getProjectConfiguration(config.id);
    onConfigUpdate(data.configuration);
  };

  const updateMutation = useMutation({
    mutationFn: ({
      lineId,
      data,
    }: {
      lineId: string;
      data: Record<string, unknown>;
    }) => updateProjectLineItem(config.id, lineId, data),
    onSuccess: refreshConfig,
  });

  const deleteMutation = useMutation({
    mutationFn: (lineId: string) => deleteProjectLineItem(config.id, lineId),
    onSuccess: refreshConfig,
  });

  // Calculate column count for empty state colspan
  let colCount = 7; // Base: #, Part#, Mnfr, Description, Qty, Cost, Actions
  if (showLocation) colCount++;
  if (showTariff) colCount += 2; // Tariff $ and Tariff %
  if (showMargin) colCount++;
  colCount += 2; // Unit Price and Total Price

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/30 border-b border-border/30">
            <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium w-8">
              #
            </th>
            <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Part #
            </th>
            <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Mnfr
            </th>
            <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium min-w-[200px]">
              Description
            </th>
            {showLocation && (
              <th className="px-3 py-2.5 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium min-w-[120px]">
                Location
              </th>
            )}
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium w-16">
              Qty
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Cost
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Unit Price
            </th>
            {showTariff && (
              <>
                <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Tariff $
                </th>
                <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Tariff %
                </th>
              </>
            )}
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Price
            </th>
            {showMargin && (
              <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Margin
              </th>
            )}
            <th className="px-3 py-2.5 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-3 py-12 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8 text-muted-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span className="text-sm">
                    No items added yet. Use the search above to add items.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            items.map((li, idx) => (
              <ProjectPartsTableRow
                key={li.id}
                lineItem={li}
                index={idx}
                locations={config.locations}
                showLocation={showLocation}
                showTariff={showTariff}
                showMargin={showMargin}
                allowPriceEdit={canEditPrice}
                onUpdateQty={(qty) =>
                  updateMutation.mutate({
                    lineId: li.id,
                    data: { quantity: qty },
                  })
                }
                onUpdatePrice={(price) =>
                  updateMutation.mutate({
                    lineId: li.id,
                    data: { productPrice: price, priceOverride: true },
                  })
                }
                onUpdateMargin={(margin) =>
                  updateMutation.mutate({
                    lineId: li.id,
                    data: { targetMargin: margin },
                  })
                }
                onUpdateLocation={(locationId) =>
                  updateMutation.mutate({
                    lineId: li.id,
                    data: { locationId },
                  })
                }
                onDelete={() => deleteMutation.mutate(li.id)}
                isUpdating={updateMutation.isPending}
                fmt={fmt}
                pctFmt={pctFmt}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface ProjectPartsTableRowProps {
  lineItem: ProjectLineItem;
  index: number;
  locations: ProjectLocation[];
  showLocation: boolean;
  showTariff: boolean;
  showMargin: boolean;
  allowPriceEdit: boolean;
  onUpdateQty: (qty: number) => void;
  onUpdatePrice: (price: number) => void;
  onUpdateMargin: (margin: number) => void;
  onUpdateLocation: (locationId: string | null) => void;
  onDelete: () => void;
  isUpdating: boolean;
  fmt: (n: number | string) => string;
  pctFmt: (n: number | string) => string;
}

function ProjectPartsTableRow({
  lineItem: li,
  index,
  locations,
  showLocation,
  showTariff,
  showMargin,
  allowPriceEdit,
  onUpdateQty,
  onUpdatePrice,
  onUpdateMargin,
  onUpdateLocation,
  onDelete,
  isUpdating,
  fmt,
  pctFmt,
}: ProjectPartsTableRowProps) {
  const [editingQty, setEditingQty] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingMargin, setEditingMargin] = useState(false);
  const [qtyValue, setQtyValue] = useState(String(li.quantity));
  const [priceValue, setPriceValue] = useState(
    String(Number(li.productPrice))
  );
  const [marginInputValue, setMarginInputValue] = useState(
    String((Number(li.margin) * 100).toFixed(1))
  );

  const marginValue = Number(li.margin);
  const marginColor =
    marginValue >= 0.3
      ? "text-green-700"
      : marginValue >= 0.2
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <tr className="border-b border-border/20 hover:bg-secondary/20 transition-colors even:bg-secondary/5">
      <td className="px-3 py-2.5 text-muted-foreground">{index + 1}</td>
      <td className="px-3 py-2.5 font-medium">{li.partNumber}</td>
      <td className="px-3 py-2.5 text-muted-foreground">{li.manufacturer}</td>
      <td className="px-3 py-2.5 text-muted-foreground text-xs">
        {li.description}
      </td>

      {/* Location dropdown */}
      {showLocation && (
        <td className="px-3 py-2.5">
          <select
            className="w-full px-2 py-1 text-xs bg-secondary/50 border border-border/50 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={li.locationId || ""}
            onChange={(e) => onUpdateLocation(e.target.value || null)}
          >
            <option value="">No location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </td>
      )}

      {/* Qty — editable */}
      <td className="px-3 py-2.5 text-right">
        {editingQty ? (
          <input
            type="number"
            className="w-16 px-1 py-0.5 border border-primary/30 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={qtyValue}
            onChange={(e) => setQtyValue(e.target.value)}
            onBlur={() => {
              setEditingQty(false);
              const v = parseInt(qtyValue);
              if (v > 0 && v !== li.quantity) onUpdateQty(v);
              else setQtyValue(String(li.quantity));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setQtyValue(String(li.quantity));
                setEditingQty(false);
              }
            }}
            autoFocus
            min={1}
          />
        ) : (
          <button
            className="border-b border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-colors"
            onClick={() => setEditingQty(true)}
          >
            {li.quantity}
          </button>
        )}
      </td>

      <td className="px-3 py-2.5 text-right">{fmt(li.unitCost)}</td>

      {/* Unit Price — editable if allowPriceEdit is true */}
      <td className="px-3 py-2.5 text-right">
        {allowPriceEdit && editingPrice ? (
          <input
            type="number"
            className="w-20 px-1 py-0.5 border border-primary/30 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            onBlur={() => {
              setEditingPrice(false);
              const v = parseFloat(priceValue);
              if (v > 0 && v !== Number(li.productPrice)) onUpdatePrice(v);
              else setPriceValue(String(Number(li.productPrice)));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setPriceValue(String(Number(li.productPrice)));
                setEditingPrice(false);
              }
            }}
            autoFocus
            step="0.01"
            min="0"
          />
        ) : (
          <button
            className={
              allowPriceEdit
                ? "border-b border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-colors"
                : "cursor-default"
            }
            onClick={() => allowPriceEdit && setEditingPrice(true)}
          >
            {fmt(li.productPrice)}
          </button>
        )}
      </td>

      {/* Tariff columns */}
      {showTariff && (
        <>
          <td className="px-3 py-2.5 text-right">{fmt(li.tariffAmount)}</td>
          <td className="px-3 py-2.5 text-right">{pctFmt(li.tariffPercent)}</td>
        </>
      )}

      <td className="px-3 py-2.5 text-right font-medium">
        {fmt(li.totalPrice)}
      </td>

      {/* Margin column - editable if allowPriceEdit is true */}
      {showMargin && (
        <td className={`px-3 py-2.5 text-right font-medium ${marginColor}`}>
          {allowPriceEdit && editingMargin ? (
            <input
              type="number"
              className="w-16 px-1 py-0.5 border border-primary/30 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              value={marginInputValue}
              onChange={(e) => setMarginInputValue(e.target.value)}
              onBlur={() => {
                setEditingMargin(false);
                const v = parseFloat(marginInputValue);
                if (!isNaN(v) && v >= 0 && v <= 100 && v / 100 !== Number(li.margin)) {
                  onUpdateMargin(v / 100);
                } else {
                  setMarginInputValue(String((Number(li.margin) * 100).toFixed(1)));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setMarginInputValue(String((Number(li.margin) * 100).toFixed(1)));
                  setEditingMargin(false);
                }
              }}
              autoFocus
              step="0.1"
              min="0"
              max="100"
            />
          ) : (
            <button
              className={
                allowPriceEdit
                  ? "border-b border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-colors"
                  : "cursor-default"
              }
              onClick={() => allowPriceEdit && setEditingMargin(true)}
            >
              {pctFmt(li.margin)}%
            </button>
          )}
        </td>
      )}

      <td className="px-3 py-2.5 text-center">
        <button
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          onClick={onDelete}
          disabled={isUpdating}
          title="Remove item"
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
      </td>
    </tr>
  );
}
