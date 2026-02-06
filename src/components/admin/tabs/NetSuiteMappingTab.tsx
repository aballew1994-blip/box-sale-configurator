"use client";

import { useQuery } from "@tanstack/react-query";
import { getFieldConfigs, type FieldConfig } from "@/lib/api-client";

export function NetSuiteMappingTab() {
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
        Loading mappings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load mappings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          NetSuite Field Mapping
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure how fields map to NetSuite for data synchronization. This
          feature is available for future integration.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground">
            Field Mappings
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/30 border-b border-border/30">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Local Field
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Field Type
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  NetSuite Field
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((field) => (
                <MappingRow key={field.id} field={field} />
              ))}
            </tbody>
          </table>
        </div>

        {(!data || data.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            No field configurations found.
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-amber-800">
              Coming Soon: Advanced Mapping
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              The ability to configure NetSuite field mappings with custom
              transformations will be available in a future update. For now,
              mappings are defined in the system configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MappingRowProps {
  field: FieldConfig;
}

function MappingRow({ field }: MappingRowProps) {
  return (
    <tr className="border-b border-border/20 hover:bg-secondary/10 transition-colors">
      <td className="px-4 py-3">
        <div>
          <span className="font-medium text-foreground">{field.displayName}</span>
          <span className="block text-xs text-muted-foreground font-mono">
            {field.fieldKey}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-0.5 text-xs bg-secondary rounded">
          {field.fieldType}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{field.section}</td>
      <td className="px-4 py-3">
        {field.netsuiteField ? (
          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            {field.netsuiteField}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Not mapped</span>
        )}
      </td>
      <td className="px-4 py-3">
        {field.netsuiteField ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Mapped
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </td>
    </tr>
  );
}
