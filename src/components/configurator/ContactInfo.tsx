"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface ContactInfoProps {
  config: Configuration;
  onConfigUpdate: (config: Configuration) => void;
}

export function ContactInfo({ config, onConfigUpdate }: ContactInfoProps) {
  const [firstName, setFirstName] = useState(config.contactFirstName || "");
  const [lastName, setLastName] = useState(config.contactLastName || "");
  const [email, setEmail] = useState(config.contactEmail || "");

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: string) => {
      mutation.mutate({ [field]: value });
    },
    [config.id]
  );

  const inputClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Contact Information
          </h3>
          <p className="text-sm text-muted-foreground">
            Primary addressee for the proposal
          </p>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              First Name
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => saveField("contactFirstName", firstName)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => saveField("contactLastName", lastName)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              className={inputClass}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => saveField("contactEmail", email)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
