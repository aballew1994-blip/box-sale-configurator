"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";
import { useWizard } from "./WizardContext";
import { Button, Card, Textarea, LoadingText } from "@/components/ui";

interface WizardSectionEditorProps {
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function WizardSectionEditor({ onConfigUpdate }: WizardSectionEditorProps) {
  const {
    config,
    currentSection,
    sectionValues,
    setSavingSection,
    setSaveError,
    savingSection,
    saveError,
  } = useWizard();

  const [localValue, setLocalValue] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value when section changes
  useEffect(() => {
    if (currentSection) {
      const value = sectionValues[currentSection.field] || "";
      setLocalValue(value);
      setHasUnsavedChanges(false);
    }
  }, [currentSection, sectionValues]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => {
      onConfigUpdate(data.configuration);
      setSavingSection(null);
      setSaveError(null);
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      setSavingSection(null);
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    },
  });

  const saveValue = useCallback(
    (value: string) => {
      if (!currentSection) return;
      setSavingSection(currentSection.field);
      setSaveError(null);
      updateMutation.mutate({ [currentSection.field]: value || null });
    },
    [currentSection, updateMutation, setSavingSection, setSaveError]
  );

  // Debounced autosave
  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value);
      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for autosave
      saveTimeoutRef.current = setTimeout(() => {
        saveValue(value);
      }, 500);
    },
    [saveValue]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (!currentSection) return;
    const defaultValue = currentSection.defaultValue || "";
    setLocalValue(defaultValue);
    saveValue(defaultValue);
  }, [currentSection, saveValue]);

  if (!currentSection) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No section selected</p>
      </Card>
    );
  }

  const characterCount = localValue.length;
  const isSaving = savingSection === currentSection.field;

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{currentSection.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{currentSection.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSaving && <LoadingText text="Saving..." size="sm" />}
            {!isSaving && hasUnsavedChanges && (
              <span className="text-xs text-status-warning">Unsaved changes</span>
            )}
            {!isSaving && !hasUnsavedChanges && localValue && (
              <span className="text-xs text-status-success flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 py-4 min-h-0">
        <Textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${currentSection.label.toLowerCase()} content...`}
          className="h-full min-h-[300px] resize-none"
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{characterCount} characters</span>
            {saveError && (
              <span className="text-xs text-status-error flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {saveError}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset Section
          </Button>
        </div>
      </div>
    </Card>
  );
}
