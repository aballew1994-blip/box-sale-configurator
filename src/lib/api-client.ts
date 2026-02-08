/**
 * Client-side API helper functions for the configurator.
 */

const BASE = "";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

// Items
export async function searchItems(query: string, limit = 25, offset = 0) {
  const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) });
  const res = await fetch(`${BASE}/api/items/search?${params}`);
  return handleResponse<{
    items: Array<{
      internalId: string;
      itemId: string;
      displayName: string;
      description: string;
      manufacturer: string;
      itemType: string;
      isActive: boolean;
      cost: number;
      basePrice: number;
      quantityAvailable?: number;
    }>;
    total: number;
    hasMore: boolean;
  }>(res);
}

export async function searchItemsWithFilters(
  query: string,
  tableKey: string,
  limit = 25,
  offset = 0
) {
  const params = new URLSearchParams({
    q: query,
    tableKey,
    limit: String(limit),
    offset: String(offset),
  });
  const res = await fetch(`${BASE}/api/items/search?${params}`);
  return handleResponse<{
    items: Array<{
      internalId: string;
      itemId: string;
      displayName: string;
      description: string;
      manufacturer: string;
      itemType: string;
      isActive: boolean;
      cost: number;
      basePrice: number;
      quantityAvailable?: number;
    }>;
    total: number;
    hasMore: boolean;
  }>(res);
}

// Configuration
export async function createConfiguration(estimateId: string) {
  const res = await fetch(`${BASE}/api/configurations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimateId }),
  });
  return handleResponse<{ configuration: Configuration }>(res);
}

export async function getConfiguration(id: string) {
  const res = await fetch(`${BASE}/api/configurations/${id}`);
  return handleResponse<{ configuration: Configuration }>(res);
}

export async function updateConfiguration(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/configurations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ configuration: Configuration }>(res);
}

// Line items
export async function addLineItem(configId: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/configurations/${configId}/lines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ lineItem: LineItem }>(res);
}

export async function updateLineItem(
  configId: string,
  lineId: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/api/configurations/${configId}/lines/${lineId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ lineItem: LineItem }>(res);
}

export async function deleteLineItem(configId: string, lineId: string) {
  const res = await fetch(`${BASE}/api/configurations/${configId}/lines/${lineId}`, {
    method: "DELETE",
  });
  return handleResponse<{ deleted: boolean }>(res);
}

// CSV Import
export async function importCsv(configId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/configurations/${configId}/import-csv`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<{
    added: number;
    errors: Array<{ row: number; partNumber: string; message: string }>;
  }>(res);
}

// Submit
export async function submitConfiguration(configId: string) {
  const res = await fetch(`${BASE}/api/configurations/${configId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<{ submission: Submission }>(res);
}

// Proposal
export async function downloadProposal(configId: string): Promise<Blob> {
  const res = await fetch(`${BASE}/api/configurations/${configId}/proposal`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to generate proposal");
  }
  return res.blob();
}

// Types matching API responses
export interface Configuration {
  id: string;
  estimateId: string | null;
  estimateNumber: string | null;
  customerId: string | null;
  customerName: string | null;
  version: number;
  status: string;
  accessControlCards: boolean;
  allowCustomMargin: boolean;
  licensingSSA: boolean;
  saas: boolean;
  defaultMargin: number | string;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  siteAddressOverride: string | null;
  billingAddressOverride: string | null;
  consolidateLabor: boolean;
  scopeOfWork: string | null;
  proposalSummary: string | null;
  shippingFee: number | string;
  shippingOverride: boolean;

  // ACS Card Details
  acsFormat: string | null;
  acsFacilityCode: string | null;
  acsQuantity: number | null;
  acsStartNumber: number | null;
  acsEndNumber: number | null;

  // Licensing & SSA
  systemId: string | null;

  // SaaS
  saasTerm: number | null;
  saasStartDate: string | null;
  saasEndDate: string | null;
  saasEffectiveDateNotes: string | null;
  saasBillingSchedule: string | null;

  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  lineItems: LineItem[];
}

export interface LineItem {
  id: string;
  configurationId: string;
  lineNumber: number;
  itemId: string;
  partNumber: string;
  manufacturer: string | null;
  description: string | null;
  quantity: number;
  unitCost: number | string;
  targetMargin: number | string;
  productPrice: number | string;
  priceOverride: boolean;
  tariffPercent: number | string;
  tariffAmount: number | string;
  margin: number | string;
  extCost: number | string;
  totalPrice: number | string;
}

export interface Submission {
  id: string;
  configurationId: string;
  idempotencyKey: string;
  version: number;
  status: string;
  errorMessage: string | null;
  attempts: number;
  createdAt: string;
}

// ============================================================
// PROJECT CONFIGURATION
// ============================================================

// Project Configuration
export async function createProjectConfiguration(estimateId: string) {
  const res = await fetch(`${BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimateId }),
  });
  return handleResponse<{ configuration: ProjectConfiguration }>(res);
}

export async function getProjectConfiguration(id: string) {
  const res = await fetch(`${BASE}/api/projects/${id}`);
  return handleResponse<{ configuration: ProjectConfiguration }>(res);
}

export async function updateProjectConfiguration(
  id: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ configuration: ProjectConfiguration }>(res);
}

// Project Line Items
export async function addProjectLineItem(
  configId: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/api/projects/${configId}/lines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ lineItem: ProjectLineItem }>(res);
}

export async function updateProjectLineItem(
  configId: string,
  lineId: string,
  data: Record<string, unknown>
) {
  const res = await fetch(`${BASE}/api/projects/${configId}/lines/${lineId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ lineItem: ProjectLineItem }>(res);
}

export async function deleteProjectLineItem(configId: string, lineId: string) {
  const res = await fetch(`${BASE}/api/projects/${configId}/lines/${lineId}`, {
    method: "DELETE",
  });
  return handleResponse<{ deleted: boolean }>(res);
}

// Project Locations
export async function getProjectLocations(configId: string) {
  const res = await fetch(`${BASE}/api/projects/${configId}/locations`);
  return handleResponse<{ locations: ProjectLocation[] }>(res);
}

export async function createProjectLocation(configId: string, name: string) {
  const res = await fetch(`${BASE}/api/projects/${configId}/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return handleResponse<{ location: ProjectLocation }>(res);
}

export async function updateProjectLocation(
  configId: string,
  locationId: string,
  data: { name?: string; sortOrder?: number }
) {
  const res = await fetch(
    `${BASE}/api/projects/${configId}/locations/${locationId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return handleResponse<{ location: ProjectLocation }>(res);
}

export async function deleteProjectLocation(
  configId: string,
  locationId: string
) {
  const res = await fetch(
    `${BASE}/api/projects/${configId}/locations/${locationId}`,
    {
      method: "DELETE",
    }
  );
  return handleResponse<{ deleted: boolean }>(res);
}

// Project Proposal
export async function downloadProjectProposal(configId: string): Promise<Blob> {
  const res = await fetch(`${BASE}/api/projects/${configId}/proposal`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to generate proposal");
  }
  return res.blob();
}

// Project Types
export type ProjectLineCategory =
  | "TSI_PROVIDED_PARTS"
  | "SUBCONTRACTOR_PARTS"
  | "INSTALLATION_LABOR"
  | "SUBCONTRACTOR_LABOR"
  | "PROJECT_MANAGEMENT"
  | "MISC_LABOR"
  | "TRAVEL_COSTS";

export interface ProjectLocation {
  id: string;
  configurationId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLineItem {
  id: string;
  configurationId: string;
  category: ProjectLineCategory;
  lineNumber: number;
  itemId: string;
  partNumber: string;
  manufacturer: string | null;
  description: string | null;
  quantity: number;
  locationId: string | null;
  location: ProjectLocation | null;
  unitCost: number | string;
  targetMargin: number | string;
  productPrice: number | string;
  priceOverride: boolean;
  tariffPercent: number | string;
  tariffAmount: number | string;
  margin: number | string;
  extCost: number | string;
  totalPrice: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfiguration {
  id: string;
  estimateId: string | null;
  estimateNumber: string | null;
  customerId: string | null;
  customerName: string | null;
  version: number;
  status: string;

  // Customer Information
  customerType: string | null;
  acknowledgeNewClientForm: boolean;
  isOUS: boolean;
  hasLocalCostsVAT: boolean;

  // Resource Information
  subRequired: boolean;
  subQuote: boolean;
  specialWorkingHours: boolean;
  specialWorkingHoursDetails: string | null;
  unionLabor: boolean;
  prevailingWage: boolean;
  additionalScreening: boolean;
  additionalScreeningDetails: string | null;
  proServicesOrSA: boolean;
  proServicesLocation: string | null;
  remoteAccessMethod: string | null;
  trainingType: string | null;

  // Installation Details
  liftPlatformLadder: boolean;
  liftPlatformLadderDetails: string | null;
  dustContainment: boolean;
  dustContainmentDetails: string | null;
  conduit: boolean;
  conduitDetails: string | null;
  fireCaulk: boolean;
  fireCaulkDetails: string | null;
  fireAlarmRelay: boolean;
  fireAlarmRelayDetails: string | null;
  permits: boolean;
  permitsDetails: string | null;
  siteOwlDrawing: boolean;
  siteOwlDrawingDetails: string | null;
  certOfInsurance: boolean;
  certOfInsuranceDetails: string | null;
  badgingRequired: boolean;
  badgingRequiredDetails: string | null;
  specialInstructions: string | null;

  // Post Installation
  postInstallPlan: string | null;
  focusAmount: number | string | null;
  includeFocusInProject: boolean;

  // Materials Toggles
  accessControlCards: boolean;
  allowCustomMargin: boolean;
  licensingSSA: boolean;
  saas: boolean;

  // ACS Card Details
  acsFormat: string | null;
  acsFacilityCode: string | null;
  acsQuantity: number | null;
  acsStartNumber: number | null;
  acsEndNumber: number | null;

  // Licensing & SSA
  systemId: string | null;

  // SaaS
  saasTerm: number | null;
  saasStartDate: string | null;
  saasEndDate: string | null;
  saasEffectiveDateNotes: string | null;
  saasBillingSchedule: string | null;

  // Indirect Cost
  indirectCost: number | string;
  indirectCostOverride: boolean;

  // Scope of Work
  installationScope: string | null;
  customerProvidedScope: string | null;
  proServicesScope: string | null;
  solutionsArchitectScope: string | null;
  constraintsAssumptions: string | null;
  exclusions: string | null;
  focusScope: string | null;

  // Proposal Details
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  siteAddressOverride: string | null;
  billingAddressOverride: string | null;
  consolidateLabor: boolean;
  introduction: string | null;
  termsType: string | null;

  // Pricing
  defaultMargin: number | string;

  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  lineItems: ProjectLineItem[];
  locations: ProjectLocation[];
}

// ============================================================
// ADMIN CONFIGURATION
// ============================================================

// Table Filter Config
export interface TableFilterConfig {
  id: string;
  tableKey: string;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  filters: {
    itemTypes?: string[];
    nameContains?: string[];
    nameExcludes?: string[];
    manufacturers?: string[];
    costMin?: number | null;
    costMax?: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getTableFilterConfigs() {
  const res = await fetch(`${BASE}/api/admin/table-filters`);
  return handleResponse<{ configs: TableFilterConfig[] }>(res);
}

export async function getTableFilterConfig(tableKey: string) {
  const res = await fetch(`${BASE}/api/admin/table-filters/${tableKey}`);
  return handleResponse<{ config: TableFilterConfig }>(res);
}

export async function updateTableFilterConfig(
  tableKey: string,
  data: Partial<TableFilterConfig>
) {
  const res = await fetch(`${BASE}/api/admin/table-filters/${tableKey}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ config: TableFilterConfig }>(res);
}

// Field Config
export interface FieldOption {
  id: string;
  fieldId: string;
  value: string;
  label: string;
  sortOrder: number;
  isEnabled: boolean;
  netsuiteValue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldConfig {
  id: string;
  fieldKey: string;
  fieldType: string;
  displayName: string;
  description: string | null;
  section: string;
  sortOrder: number;
  isEnabled: boolean;
  isRequired: boolean;
  netsuiteField: string | null;
  showWhen: { field: string; equals: string[] } | null;
  options: FieldOption[];
  createdAt: string;
  updatedAt: string;
}

export async function getFieldConfigs(section?: string) {
  const params = section ? `?section=${section}` : "";
  const res = await fetch(`${BASE}/api/admin/fields${params}`);
  return handleResponse<{ fields: FieldConfig[] }>(res);
}

export async function getFieldConfig(fieldKey: string) {
  const res = await fetch(`${BASE}/api/admin/fields/by-key/${fieldKey}`);
  return handleResponse<{ field: FieldConfig }>(res);
}

export async function updateFieldConfig(id: string, data: Partial<FieldConfig>) {
  const res = await fetch(`${BASE}/api/admin/fields/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ field: FieldConfig }>(res);
}

export async function createFieldConfig(data: {
  fieldKey: string;
  fieldType: string;
  displayName: string;
  section: string;
}) {
  const res = await fetch(`${BASE}/api/admin/fields`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ field: FieldConfig }>(res);
}

export async function deleteFieldConfig(id: string) {
  const res = await fetch(`${BASE}/api/admin/fields/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ deleted: boolean }>(res);
}

// Field Options
export async function createFieldOption(
  fieldId: string,
  data: { value: string; label: string }
) {
  const res = await fetch(`${BASE}/api/admin/fields/${fieldId}/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ option: FieldOption }>(res);
}

export async function updateFieldOption(
  fieldId: string,
  optionId: string,
  data: Partial<FieldOption>
) {
  const res = await fetch(
    `${BASE}/api/admin/fields/${fieldId}/options/${optionId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return handleResponse<{ option: FieldOption }>(res);
}

export async function reorderFieldOptions(fieldId: string, optionIds: string[]) {
  const res = await fetch(`${BASE}/api/admin/fields/${fieldId}/options`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionIds }),
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function deleteFieldOption(fieldId: string, optionId: string) {
  const res = await fetch(
    `${BASE}/api/admin/fields/${fieldId}/options/${optionId}`,
    {
      method: "DELETE",
    }
  );
  return handleResponse<{ deleted: boolean }>(res);
}

// ============================================================
// MANUFACTURER TARIFFS
// ============================================================

export interface ManufacturerTariff {
  id: string;
  manufacturer: string;
  tariffPercent: number | string;
  isEnabled: boolean;
  netsuiteItemId: string | null;
  netsuiteItemNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getManufacturerTariffs() {
  const res = await fetch(`${BASE}/api/admin/tariffs`);
  return handleResponse<{ tariffs: ManufacturerTariff[] }>(res);
}

export async function getManufacturerTariff(id: string) {
  const res = await fetch(`${BASE}/api/admin/tariffs/${id}`);
  return handleResponse<{ tariff: ManufacturerTariff }>(res);
}

export async function createManufacturerTariff(data: {
  manufacturer: string;
  tariffPercent: number;
  netsuiteItemId?: string | null;
  netsuiteItemNumber?: string | null;
}) {
  const res = await fetch(`${BASE}/api/admin/tariffs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ tariff: ManufacturerTariff }>(res);
}

export async function updateManufacturerTariff(
  id: string,
  data: Partial<Omit<ManufacturerTariff, "id" | "createdAt" | "updatedAt">>
) {
  const res = await fetch(`${BASE}/api/admin/tariffs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<{ tariff: ManufacturerTariff }>(res);
}

export async function deleteManufacturerTariff(id: string) {
  const res = await fetch(`${BASE}/api/admin/tariffs/${id}`, {
    method: "DELETE",
  });
  return handleResponse<{ deleted: boolean }>(res);
}

export async function lookupManufacturerTariff(manufacturer: string) {
  const res = await fetch(
    `${BASE}/api/admin/tariffs/lookup/${encodeURIComponent(manufacturer)}`
  );
  return handleResponse<{
    manufacturer: string;
    tariffPercent: number;
    found: boolean;
  }>(res);
}
