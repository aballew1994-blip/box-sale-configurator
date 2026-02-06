"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";

interface ProposalDetailsTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function ProposalDetailsTab({ config, onConfigUpdate }: ProposalDetailsTabProps) {
  const [firstName, setFirstName] = useState(config.contactFirstName || "");
  const [lastName, setLastName] = useState(config.contactLastName || "");
  const [email, setEmail] = useState(config.contactEmail || "");
  const [introduction, setIntroduction] = useState(config.introduction || "");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string | null) => {
      mutation.mutate({ [field]: value });
    },
    [mutation]
  );

  const inputClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none";

  const selectClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none appearance-none";

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Contact Information</h3>
            <p className="text-sm text-muted-foreground">Primary contact for the proposal</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                First Name
              </label>
              <input
                type="text"
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => saveField("contactFirstName", firstName || null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => saveField("contactLastName", lastName || null)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => saveField("contactEmail", email || null)}
            />
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Introduction</h3>
            <p className="text-sm text-muted-foreground">Proposal introduction text</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
          <textarea
            className={`${inputClass} min-h-[160px] resize-y`}
            placeholder="Enter the proposal introduction..."
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            onBlur={() => saveField("introduction", introduction || null)}
          />
        </div>
      </div>

      {/* Terms */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Terms</h3>
            <p className="text-sm text-muted-foreground">Terms of sale configuration</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Custom Terms of Sale or Existing MSA
          </label>
          <select
            className={selectClass}
            value={config.termsType || ""}
            onChange={(e) => saveField("termsType", e.target.value || null)}
          >
            <option value="">Select terms type...</option>
            <option value="CUSTOM_TERMS">Custom Terms of Sale</option>
            <option value="EXISTING_MSA">Existing MSA</option>
            <option value="STANDARD">Standard Terms</option>
          </select>
        </div>
      </div>
    </div>
  );
}
