"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  updateLineItem as apiUpdateLine,
  deleteLineItem as apiDeleteLine,
  getConfiguration,
} from "@/lib/api-client";
import type { Configuration, LineItem } from "@/lib/api-client";

interface PartsTableProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
  allowCustomMargin: boolean;
}

export function PartsTable({
  config,
  onConfigUpdate,
  allowCustomMargin,
}: PartsTableProps) {
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
    const data = await getConfiguration(config.id);
    onConfigUpdate(data.configuration);
  };

  const updateMutation = useMutation({
    mutationFn: ({
      lineId,
      data,
    }: {
      lineId: string;
      data: Record<string, unknown>;
    }) => apiUpdateLine(config.id, lineId, data),
    onSuccess: refreshConfig,
  });

  const deleteMutation = useMutation({
    mutationFn: (lineId: string) => apiDeleteLine(config.id, lineId),
    onSuccess: refreshConfig,
  });

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
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium w-16">
              Qty
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Cost
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Ext. Cost
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Product Price
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Tariff $
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Price
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Margin
            </th>
            <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Tariff %
            </th>
            <th className="px-3 py-2.5 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {config.lineItems.length === 0 ? (
            <tr>
              <td
                colSpan={13}
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
                    No parts added yet. Use the search above to add items.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            config.lineItems.map((li, idx) => (
              <PartsTableRow
                key={li.id}
                lineItem={li}
                index={idx}
                allowCustomMargin={allowCustomMargin}
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

interface PartsTableRowProps {
  lineItem: LineItem;
  index: number;
  allowCustomMargin: boolean;
  onUpdateQty: (qty: number) => void;
  onUpdatePrice: (price: number) => void;
  onDelete: () => void;
  isUpdating: boolean;
  fmt: (n: number | string) => string;
  pctFmt: (n: number | string) => string;
}

function PartsTableRow({
  lineItem: li,
  index,
  allowCustomMargin,
  onUpdateQty,
  onUpdatePrice,
  onDelete,
  isUpdating,
  fmt,
  pctFmt,
}: PartsTableRowProps) {
  const [editingQty, setEditingQty] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [qtyValue, setQtyValue] = useState(String(li.quantity));
  const [priceValue, setPriceValue] = useState(
    String(Number(li.productPrice))
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
      <td className="px-3 py-2.5 text-right">{fmt(li.extCost)}</td>

      {/* Product Price — editable if custom margin allowed */}
      <td className="px-3 py-2.5 text-right">
        {allowCustomMargin && editingPrice ? (
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
              allowCustomMargin
                ? "border-b border-dashed border-muted-foreground/40 hover:border-primary cursor-pointer transition-colors"
                : "cursor-default"
            }
            onClick={() => allowCustomMargin && setEditingPrice(true)}
          >
            {fmt(li.productPrice)}
          </button>
        )}
      </td>

      <td className="px-3 py-2.5 text-right">{fmt(li.tariffAmount)}</td>
      <td className="px-3 py-2.5 text-right font-medium">
        {fmt(li.totalPrice)}
      </td>
      <td className={`px-3 py-2.5 text-right font-medium ${marginColor}`}>
        {pctFmt(li.margin)}%
      </td>
      <td className="px-3 py-2.5 text-right">{pctFmt(li.tariffPercent)}</td>

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
