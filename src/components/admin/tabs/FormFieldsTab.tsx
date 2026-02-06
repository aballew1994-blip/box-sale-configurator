"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getFieldConfigs,
  updateFieldOption,
  createFieldOption,
  deleteFieldOption,
  reorderFieldOptions,
  type FieldConfig,
  type FieldOption,
} from "@/lib/api-client";

const SECTIONS = [
  { key: "customerInfo", label: "Customer Information" },
  { key: "resourceInfo", label: "Resource Information" },
  { key: "installation", label: "Installation Details" },
  { key: "postInstall", label: "Post Installation" },
  { key: "proposal", label: "Proposal Details" },
];

export function FormFieldsTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fieldConfigs"],
    queryFn: async () => {
      const result = await getFieldConfigs();
      return result.fields;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading form fields...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load form fields
      </div>
    );
  }

  // Group fields by section
  const fieldsBySection = SECTIONS.map((section) => ({
    ...section,
    fields: data?.filter((f) => f.section === section.key) || [],
  }));

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Form Fields</h2>
        <p className="text-sm text-muted-foreground">
          Manage dropdown options for each field. Drag to reorder, click to edit
          labels, or toggle visibility.
        </p>
      </div>

      {fieldsBySection.map((section) => (
        <SectionCard key={section.key} section={section} />
      ))}
    </div>
  );
}

interface SectionCardProps {
  section: {
    key: string;
    label: string;
    fields: FieldConfig[];
  };
}

function SectionCard({ section }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (section.fields.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {section.fields.length} field(s)
          </span>
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
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

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {section.fields.map((field) => (
            <FieldCard key={field.id} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FieldCardProps {
  field: FieldConfig;
}

function FieldCard({ field }: FieldCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: (optionIds: string[]) => reorderFieldOptions(field.id, optionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldConfigs"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { value: string; label: string }) =>
      createFieldOption(field.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldConfigs"] });
      setNewOptionLabel("");
      setNewOptionValue("");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = field.options.findIndex((o) => o.id === active.id);
    const newIndex = field.options.findIndex((o) => o.id === over.id);

    const newOrder = arrayMove(field.options, oldIndex, newIndex);
    reorderMutation.mutate(newOrder.map((o) => o.id));
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return;
    createMutation.mutate({
      value: newOptionValue.trim().toUpperCase().replace(/\s+/g, "_"),
      label: newOptionLabel.trim(),
    });
  };

  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-secondary/20 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {field.displayName}
          </span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-secondary rounded">
            {field.fieldType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {field.options.length} options
          </span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
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

      {isExpanded && (
        <div className="p-4 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={field.options.map((o) => o.id)}
              strategy={verticalListSortingStrategy}
            >
              {field.options.map((option) => (
                <SortableOptionRow
                  key={option.id}
                  option={option}
                  fieldId={field.id}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add new option */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                placeholder="Label (e.g., New Option)"
                className="flex-1 px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                placeholder="Value (e.g., NEW_OPTION)"
                className="flex-1 px-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddOption}
                disabled={
                  !newOptionLabel.trim() ||
                  !newOptionValue.trim() ||
                  createMutation.isPending
                }
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SortableOptionRowProps {
  option: FieldOption;
  fieldId: string;
}

function SortableOptionRow({ option, fieldId }: SortableOptionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(option.label);
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FieldOption>) =>
      updateFieldOption(fieldId, option.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldConfigs"] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFieldOption(fieldId, option.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fieldConfigs"] });
    },
  });

  const handleSaveLabel = () => {
    if (editLabel.trim() && editLabel !== option.label) {
      updateMutation.mutate({ label: editLabel.trim() });
    } else {
      setIsEditing(false);
      setEditLabel(option.label);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 bg-white border border-border/30 rounded-lg ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </button>

      {/* Label (editable) */}
      {isEditing ? (
        <input
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleSaveLabel}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveLabel();
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditLabel(option.label);
            }
          }}
          className="flex-1 px-2 py-1 text-sm border border-primary/30 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 text-left text-sm text-foreground hover:text-primary transition-colors"
        >
          {option.label}
        </button>
      )}

      {/* Value badge */}
      <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded font-mono">
        {option.value}
      </span>

      {/* Enabled toggle */}
      <button
        onClick={() => updateMutation.mutate({ isEnabled: !option.isEnabled })}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          option.isEnabled
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {option.isEnabled ? "Enabled" : "Disabled"}
      </button>

      {/* Delete button */}
      <button
        onClick={() => {
          if (confirm("Delete this option?")) {
            deleteMutation.mutate();
          }
        }}
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
    </div>
  );
}
