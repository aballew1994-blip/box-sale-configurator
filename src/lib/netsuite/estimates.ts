import { netsuiteRequest, isMockMode } from "./client";
import {
  mockGetEstimate,
  mockWriteEstimateLines,
} from "./mock";
import type {
  EstimateFetchResult,
  EstimateWriteBody,
  EstimateWriteResult,
} from "./types";

const DATA_FETCH_SCRIPT = process.env.NS_DATA_FETCH_SCRIPT || "customscript_box_data_fetch";
const DATA_FETCH_DEPLOY = process.env.NS_DATA_FETCH_DEPLOY || "customdeploy_box_data_fetch";
const ESTIMATE_WRITER_SCRIPT = process.env.NS_ESTIMATE_WRITER_SCRIPT || "customscript_box_est_writer";
const ESTIMATE_WRITER_DEPLOY = process.env.NS_ESTIMATE_WRITER_DEPLOY || "customdeploy_box_est_writer";

/**
 * Fetch estimate + customer data from NetSuite.
 */
export async function getEstimate(
  estimateId: string
): Promise<EstimateFetchResult> {
  if (isMockMode()) {
    return mockGetEstimate(estimateId);
  }

  return netsuiteRequest<EstimateFetchResult>({
    scriptId: DATA_FETCH_SCRIPT,
    deployId: DATA_FETCH_DEPLOY,
    method: "GET",
    params: { estimateId },
    timeoutMs: 30000,
  });
}

/**
 * Write line items to a NetSuite Estimate.
 * Uses idempotency key to prevent duplicate writes.
 */
export async function writeEstimateLines(
  payload: EstimateWriteBody
): Promise<EstimateWriteResult> {
  if (isMockMode()) {
    return mockWriteEstimateLines(
      payload.estimateId,
      payload.idempotencyKey,
      payload.lines.length
    );
  }

  return netsuiteRequest<EstimateWriteResult>({
    scriptId: ESTIMATE_WRITER_SCRIPT,
    deployId: ESTIMATE_WRITER_DEPLOY,
    method: "POST",
    body: payload,
    timeoutMs: 60000,
  });
}
