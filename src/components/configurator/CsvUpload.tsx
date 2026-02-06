"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { importCsv, getConfiguration } from "@/lib/api-client";
import type { Configuration } from "@/lib/api-client";

interface CsvUploadProps {
  configId: string;
  onImportComplete: (config: Configuration) => void;
}

export function CsvUpload({ configId, onImportComplete }: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => importCsv(configId, file),
    onSuccess: async (result) => {
      const refreshed = await getConfiguration(configId);
      onImportComplete(refreshed.configuration);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (result.errors.length > 0) {
        alert(
          `Imported ${result.added} items.\n\nErrors:\n${result.errors
            .map((e) => `Row ${e.row}: ${e.message}`)
            .join("\n")}`
        );
      }
    },
  });

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-dashed border-border rounded-lg bg-secondary/20">
      <svg
        className="w-4 h-4 text-muted-foreground shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <button
        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? selectedFile.name : "Upload CSV"}
      </button>
      {selectedFile && (
        <button
          className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          onClick={() => selectedFile && mutation.mutate(selectedFile)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Uploading..." : "Import"}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      {mutation.isError && (
        <span className="text-xs text-destructive">
          {mutation.error.message}
        </span>
      )}
    </div>
  );
}
