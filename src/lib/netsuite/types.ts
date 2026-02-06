/** NetSuite RESTlet response envelope */
export interface NetSuiteResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/** NetSuite TBA credentials */
export interface NetSuiteCredentials {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
  restletBaseUrl: string;
}

/** RESTlet script deployment identifiers */
export interface RestletDeployment {
  scriptId: string;
  deployId: string;
}

/** NetSuite item search RESTlet parameters */
export interface ItemSearchParams {
  q: string;
  type?: string;
  limit?: number;
  offset?: number;
}

/** NetSuite estimate write RESTlet body */
export interface EstimateWriteBody {
  estimateId: string;
  idempotencyKey: string;
  configVersion: number;
  replaceLines: boolean;
  lines: Array<{
    itemId: string;
    quantity: number;
    rate: number;
    description?: string;
    customColumns?: {
      custcol_box_config?: boolean;
      custcol_tariff_pct?: number;
      custcol_tariff_amt?: number;
    };
  }>;
  customFields?: Record<string, unknown>;
}

/** NetSuite estimate write RESTlet response */
export interface EstimateWriteResult {
  success: boolean;
  estimateId: string;
  lineCount: number;
  warnings: string[];
  idempotencyKey: string;
}

/** NetSuite data fetch RESTlet response */
export interface EstimateFetchResult {
  estimate: {
    internalId: string;
    tranId: string;
    status: string;
    salesRep: string;
    salesRepEmail: string;
    tranDate: string;
    memo?: string;
  };
  customer: {
    internalId: string;
    name: string;
    email?: string;
    phone?: string;
    billingAddress?: {
      addressee?: string;
      addr1?: string;
      addr2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    shippingAddress?: {
      addressee?: string;
      addr1?: string;
      addr2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  };
}

/** NetSuite item from search results */
export interface NetSuiteItemResult {
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
}
