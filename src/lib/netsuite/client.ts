import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { withRetry } from "@/lib/utils/retry";
import type { NetSuiteCredentials } from "./types";

function getCredentials(): NetSuiteCredentials {
  const accountId = process.env.NETSUITE_ACCOUNT_ID;
  const consumerKey = process.env.NETSUITE_CONSUMER_KEY;
  const consumerSecret = process.env.NETSUITE_CONSUMER_SECRET;
  const tokenId = process.env.NETSUITE_TOKEN_ID;
  const tokenSecret = process.env.NETSUITE_TOKEN_SECRET;
  const restletBaseUrl = process.env.NETSUITE_RESTLET_BASE_URL;

  if (
    !accountId ||
    !consumerKey ||
    !consumerSecret ||
    !tokenId ||
    !tokenSecret ||
    !restletBaseUrl
  ) {
    throw new Error(
      "Missing NetSuite credentials. Check environment variables."
    );
  }

  return {
    accountId,
    consumerKey,
    consumerSecret,
    tokenId,
    tokenSecret,
    restletBaseUrl,
  };
}

function createOAuthClient(creds: NetSuiteCredentials): OAuth {
  return new OAuth({
    consumer: {
      key: creds.consumerKey,
      secret: creds.consumerSecret,
    },
    signature_method: "HMAC-SHA256",
    hash_function(baseString: string, key: string) {
      return crypto
        .createHmac("sha256", key)
        .update(baseString)
        .digest("base64");
    },
    realm: creds.accountId,
  });
}

function buildAuthHeader(
  oauth: OAuth,
  url: string,
  method: string,
  creds: NetSuiteCredentials
): string {
  const token = {
    key: creds.tokenId,
    secret: creds.tokenSecret,
  };

  const authData = oauth.authorize(
    { url, method, data: null },
    token
  );

  return oauth.toHeader(authData).Authorization;
}

export interface NetSuiteRequestOptions {
  scriptId: string;
  deployId: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Make an authenticated request to a NetSuite RESTlet.
 * Uses OAuth 1.0 TBA signing with exponential backoff retry.
 */
export async function netsuiteRequest<T>(
  options: NetSuiteRequestOptions
): Promise<T> {
  const creds = getCredentials();
  const oauth = createOAuthClient(creds);

  // Build URL with script/deploy params
  const url = new URL(creds.restletBaseUrl);
  url.searchParams.set("script", options.scriptId);
  url.searchParams.set("deploy", options.deployId);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const fullUrl = url.toString();
  const authHeader = buildAuthHeader(oauth, fullUrl, options.method, creds);
  const timeoutMs = options.timeoutMs ?? 30000;

  return withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      };

      if (options.body && options.method !== "GET") {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(fullUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        const error = new Error(
          `NetSuite API error: ${response.status} ${response.statusText} — ${errorText}`
        );
        (error as Error & { status: number }).status = response.status;
        throw error;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  });
}

/** Check if NetSuite mock mode is enabled */
export function isMockMode(): boolean {
  return process.env.NETSUITE_MOCK === "true";
}
