"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";
import { Card, Input, Textarea, Select, SectionHeader } from "@/components/ui";

interface ProposalDetailsTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

const ICONS = {
  user: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  document: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clipboard: (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
};

const TERMS_OPTIONS = [
  { value: "", label: "Select terms type..." },
  { value: "CUSTOM_TERMS", label: "Custom Terms of Sale" },
  { value: "EXISTING_MSA", label: "Existing MSA" },
  { value: "STANDARD", label: "Standard Terms" },
];

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

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <SectionHeader
          icon={ICONS.user}
          title="Contact Information"
          description="Primary contact for the proposal"
          className="mb-4"
        />
        <Card>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => saveField("contactFirstName", firstName || null)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => saveField("contactLastName", lastName || null)}
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => saveField("contactEmail", email || null)}
          />
        </Card>
      </div>

      {/* Introduction */}
      <div>
        <SectionHeader
          icon={ICONS.document}
          title="Introduction"
          description="Proposal introduction text"
          className="mb-4"
        />
        <Card>
          <Textarea
            placeholder="Enter the proposal introduction..."
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            onBlur={() => saveField("introduction", introduction || null)}
            className="min-h-[160px]"
          />
        </Card>
      </div>

      {/* Terms */}
      <div>
        <SectionHeader
          icon={ICONS.clipboard}
          title="Terms"
          description="Terms of sale configuration"
          className="mb-4"
        />
        <Card>
          <Select
            label="Custom Terms of Sale or Existing MSA"
            value={config.termsType || ""}
            onChange={(e) => saveField("termsType", e.target.value || null)}
            options={TERMS_OPTIONS}
          />
        </Card>
      </div>
    </div>
  );
}
