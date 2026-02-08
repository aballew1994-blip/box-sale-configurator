"use client";

import { useState, useEffect, useRef } from "react";

interface ProposalSection {
  key: string;
  label: string;
  field: string;
  description?: string;
}

interface ProposalSectionEditorProps {
  section: ProposalSection;
  value: string;
  isActive: boolean;
  onActivate: () => void;
  onChange: (value: string) => void;
  isSaving: boolean;
}

export function ProposalSectionEditor({
  section,
  value,
  isActive,
  onActivate,
  onChange,
  isSaving,
}: ProposalSectionEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus textarea when section becomes active
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    // Debounce the save
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasContent = localValue && localValue.trim().length > 0;
  const previewText = hasContent
    ? localValue.slice(0, 200) + (localValue.length > 200 ? "..." : "")
    : "";

  return (
    <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={onActivate}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              hasContent ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <h3 className="font-semibold text-foreground">{section.label}</h3>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <svg
                className="w-3 h-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          )}
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isActive ? "rotate-180" : ""
            }`}
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
        </div>
      </button>

      {/* Editable Content - expanded when active */}
      {isActive && (
        <div className="px-5 pb-5 border-t border-border/30">
          {section.description && (
            <p className="text-xs text-muted-foreground mt-3 mb-2">
              {section.description}
            </p>
          )}
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full mt-3 bg-secondary/30 border border-border/50 rounded-lg px-4 py-3 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none min-h-[200px] resize-y font-mono"
            placeholder={`Enter ${section.label.toLowerCase()}...`}
          />
          <p className="text-xs text-muted-foreground mt-2">
            This content will appear in the generated proposal PDF.
          </p>
        </div>
      )}

      {/* Preview when collapsed */}
      {!isActive && hasContent && (
        <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border/30 pt-3 whitespace-pre-wrap line-clamp-3">
          {previewText}
        </div>
      )}

      {/* Empty state when collapsed */}
      {!isActive && !hasContent && (
        <div className="px-5 pb-4 text-sm text-muted-foreground/60 italic border-t border-border/30 pt-3">
          No content added yet. Click to expand and add content.
        </div>
      )}
    </div>
  );
}
