"use client";

import { useQuery } from "@tanstack/react-query";
import { getFieldConfig, type FieldConfig } from "@/lib/api-client";

interface DynamicDropdownProps {
  fieldKey: string;
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
}

export function DynamicDropdown({
  fieldKey,
  value,
  onChange,
  className = "",
  placeholder,
}: DynamicDropdownProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fieldConfig", fieldKey],
    queryFn: () => getFieldConfig(fieldKey),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const fieldConfig = data?.field;

  if (isLoading) {
    return (
      <select disabled className={className}>
        <option>Loading...</option>
      </select>
    );
  }

  if (error || !fieldConfig) {
    return (
      <select disabled className={className}>
        <option>Error loading options</option>
      </select>
    );
  }

  const options = fieldConfig.options
    .filter((opt) => opt.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <select
      className={className}
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">
        {placeholder || `Select ${fieldConfig.displayName}...`}
      </option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
