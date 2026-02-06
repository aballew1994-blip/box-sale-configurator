// NetSuite Item types
export interface NetSuiteItem {
  internalId: string;
  itemId: string; // Part number
  displayName: string;
  description: string;
  manufacturer: string;
  itemType: "inventoryItem" | "nonInventoryItem" | "serviceItem" | "assemblyItem";
  isActive: boolean;
  cost: number;
  basePrice: number;
  quantityAvailable?: number;
}

export interface NetSuiteEstimate {
  internalId: string;
  tranId: string; // Estimate number (e.g., "EST-12345")
  status: string;
  salesRep: string;
  salesRepEmail: string;
  memo?: string;
  tranDate: string;
  customer: NetSuiteCustomer;
}

export interface NetSuiteCustomer {
  internalId: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: NetSuiteAddress;
  shippingAddress?: NetSuiteAddress;
}

export interface NetSuiteAddress {
  addressee?: string;
  addr1?: string;
  addr2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Item search response
export interface ItemSearchResponse {
  items: NetSuiteItem[];
  total: number;
  hasMore: boolean;
}

// Estimate write request
export interface EstimateWriteRequest {
  estimateId: string;
  idempotencyKey: string;
  configVersion: number;
  replaceLines: boolean;
  lines: EstimateWriteLine[];
}

export interface EstimateWriteLine {
  itemId: string;
  quantity: number;
  rate: number;
  description?: string;
  customColumns?: Record<string, unknown>;
}

// Estimate write response
export interface EstimateWriteResponse {
  success: boolean;
  estimateId: string;
  lineCount: number;
  warnings: string[];
}

// Configuration summary for frontend
export interface ConfigurationSummary {
  totalEquipmentCost: number;
  totalPrice: number;
  shippingFee: number;
  subtotal: number;
  overallMargin: number;
  lineCount: number;
  totalQuantity: number;
}

// CSV import types
export interface CsvImportRow {
  partNumber: string;
  quantity: number;
}

export interface CsvImportResult {
  added: number;
  errors: CsvImportError[];
}

export interface CsvImportError {
  row: number;
  partNumber: string;
  message: string;
}
