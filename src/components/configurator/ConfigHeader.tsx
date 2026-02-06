"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { Configuration } from "@/lib/api-client";
import { submitConfiguration, downloadProposal } from "@/lib/api-client";
import type { ConfigSummaryComputed } from "@/lib/utils/calculations";
import { useTheme } from "@/components/theme-provider";
import Image from "next/image";

export type ConfiguratorType = "box-sales" | "projects";

interface ConfigHeaderProps {
  config: Configuration;
  summary: ConfigSummaryComputed;
  onConfigUpdate: (config: Configuration) => void;
  configuratorType?: ConfiguratorType;
  estimateId?: string | null;
}

export function ConfigHeader({
  config,
  summary,
  onConfigUpdate,
  configuratorType = "box-sales",
  estimateId,
}: ConfigHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitMutation = useMutation({
    mutationFn: () => submitConfiguration(config.id),
    onSuccess: () => {
      onConfigUpdate({ ...config, status: "SUBMITTED" });
    },
  });

  const proposalMutation = useMutation({
    mutationFn: () => downloadProposal(config.id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${config.estimateNumber || config.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const handleSubmit = async () => {
    setShowConfirm(false);
    await submitMutation.mutateAsync();
  };

  const handleTypeChange = (type: ConfiguratorType) => {
    setShowTypeDropdown(false);
    if (type !== configuratorType) {
      const estId = estimateId || config.estimateId;
      if (estId) {
        router.push(`/configure?estimateId=${estId}&type=${type}`);
      }
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const isSubmitting = submitMutation.isPending;

  const typeLabel = configuratorType === "projects" ? "Projects" : "Box Sales";

  return (
    <>
      <div className="bg-surface/80 backdrop-blur-lg border-b border-border/50 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Image
            src={theme === "dark" ? "/tsi-logo-white.svg" : "/tsi-logo.svg"}
            alt="TSi"
            width={60}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <div className="h-6 w-px bg-border/50" />

          {/* Configurator Type Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {typeLabel}
              <svg
                className={`w-4 h-4 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
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
            </button>

            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                <button
                  onClick={() => handleTypeChange("box-sales")}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-secondary transition-colors ${
                    configuratorType === "box-sales" ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  Box Sales
                  {configuratorType === "box-sales" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleTypeChange("projects")}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-secondary transition-colors ${
                    configuratorType === "projects" ? "text-primary font-medium" : "text-foreground"
                  }`}
                >
                  Projects
                  {configuratorType === "projects" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {config.estimateNumber && (
            <span className="text-sm text-muted-foreground font-medium">
              {config.estimateNumber}
            </span>
          )}
          {config.customerName && (
            <span className="text-sm text-muted-foreground">
              {config.customerName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-secondary rounded-full px-3 py-1 text-sm font-mono">
              <span className="text-muted-foreground text-xs mr-1">
                Subtotal
              </span>
              <span className="font-semibold text-foreground">
                {fmt(summary.subtotal)}
              </span>
            </span>
            <span className="bg-secondary rounded-full px-3 py-1 text-sm font-mono">
              <span className="text-muted-foreground text-xs mr-1">Qty</span>
              <span className="font-semibold text-foreground">
                {summary.totalQuantity}
              </span>
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-2 ml-2">
            <button
              className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              onClick={() => proposalMutation.mutate()}
              disabled={
                proposalMutation.isPending || config.lineItems.length === 0
              }
            >
              {proposalMutation.isPending
                ? "Generating..."
                : "Download Proposal"}
            </button>
            <span className="text-border">|</span>
            <button
              className="px-4 py-1.5 border border-border text-muted-foreground rounded-lg text-sm hover:bg-secondary transition-colors"
              onClick={() => window.close()}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              onClick={() => setShowConfirm(true)}
              disabled={
                isSubmitting ||
                config.lineItems.length === 0 ||
                config.status === "SUBMITTED"
              }
            >
              {isSubmitting ? "Submitting..." : "Submit & Close"}
            </button>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-surface rounded-2xl p-8 max-w-md shadow-2xl border border-border/50">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Confirm Submission
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              This will write {config.lineItems.length} line item(s) to
              NetSuite Estimate{" "}
              <strong className="text-foreground">
                {config.estimateNumber || config.estimateId}
              </strong>
              .
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Total:{" "}
              <strong className="text-foreground">
                {fmt(summary.subtotal)}
              </strong>
            </p>
            {submitMutation.isError && (
              <p className="text-sm text-destructive mb-4">
                Error: {submitMutation.error.message}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
