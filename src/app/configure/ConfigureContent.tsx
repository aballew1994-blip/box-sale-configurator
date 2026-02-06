"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createConfiguration,
  getConfiguration,
  createProjectConfiguration,
  getProjectConfiguration,
} from "@/lib/api-client";
import { ConfiguratorPage } from "@/components/configurator/ConfiguratorPage";
import { ProjectConfiguratorPage } from "@/components/projects/ProjectConfiguratorPage";
import { useEffect, useState } from "react";

export type ConfiguratorType = "box-sales" | "projects";

export function ConfigureContent() {
  const searchParams = useSearchParams();
  const estimateId = searchParams.get("estimateId");
  const configId = searchParams.get("configId");
  const typeParam = searchParams.get("type") as ConfiguratorType | null;
  const configuratorType: ConfiguratorType = typeParam || "box-sales";

  const [activeConfigId, setActiveConfigId] = useState<string | null>(configId);
  const queryClient = useQueryClient();

  // Create or load configuration for Box Sales
  const createBoxSalesMutation = useMutation({
    mutationFn: (estId: string) => createConfiguration(estId),
    onSuccess: (data) => {
      setActiveConfigId(data.configuration.id);
      queryClient.setQueryData(
        ["configuration", data.configuration.id],
        data
      );
    },
  });

  // Create or load configuration for Projects
  const createProjectsMutation = useMutation({
    mutationFn: (estId: string) => createProjectConfiguration(estId),
    onSuccess: (data) => {
      setActiveConfigId(data.configuration.id);
      queryClient.setQueryData(
        ["projectConfiguration", data.configuration.id],
        data
      );
    },
  });

  // Auto-create configuration when estimateId is present but no configId
  useEffect(() => {
    if (estimateId && !activeConfigId) {
      if (configuratorType === "projects" && !createProjectsMutation.isPending) {
        createProjectsMutation.mutate(estimateId);
      } else if (configuratorType === "box-sales" && !createBoxSalesMutation.isPending) {
        createBoxSalesMutation.mutate(estimateId);
      }
    }
  }, [estimateId, activeConfigId, configuratorType]);

  // Load existing Box Sales configuration
  const boxSalesQuery = useQuery({
    queryKey: ["configuration", activeConfigId],
    queryFn: () => getConfiguration(activeConfigId!),
    enabled: !!activeConfigId && configuratorType === "box-sales",
  });

  // Load existing Projects configuration
  const projectsQuery = useQuery({
    queryKey: ["projectConfiguration", activeConfigId],
    queryFn: () => getProjectConfiguration(activeConfigId!),
    enabled: !!activeConfigId && configuratorType === "projects",
  });

  const isCreating =
    createBoxSalesMutation.isPending || createProjectsMutation.isPending;
  const isLoading =
    configuratorType === "box-sales"
      ? boxSalesQuery.isLoading
      : projectsQuery.isLoading;
  const error =
    configuratorType === "box-sales"
      ? boxSalesQuery.error
      : projectsQuery.error;
  const createError =
    configuratorType === "box-sales"
      ? createBoxSalesMutation.error
      : createProjectsMutation.error;

  if (!estimateId && !configId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Missing Estimate ID
          </h1>
          <p className="text-muted-foreground">
            Please open the configurator from a NetSuite Estimate record. The
            URL should include an <code>estimateId</code> parameter.
          </p>
        </div>
      </div>
    );
  }

  if (isCreating || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configurator...</p>
        </div>
      </div>
    );
  }

  if (createError || error) {
    const errMsg =
      createError?.message || (error as Error)?.message || "Unknown error";
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{errMsg}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
            onClick={() => {
              if (estimateId) {
                if (configuratorType === "projects") {
                  createProjectsMutation.mutate(estimateId);
                } else {
                  createBoxSalesMutation.mutate(estimateId);
                }
              }
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate configurator
  if (configuratorType === "projects") {
    const projectConfig = projectsQuery.data?.configuration;
    if (!projectConfig) return null;
    return (
      <ProjectConfiguratorPage
        configuration={projectConfig}
        estimateId={estimateId}
      />
    );
  }

  // Default: Box Sales
  const boxSalesConfig = boxSalesQuery.data?.configuration;
  if (!boxSalesConfig) return null;
  return (
    <ConfiguratorPage
      configuration={boxSalesConfig}
      estimateId={estimateId}
    />
  );
}
