import { prisma } from "@/lib/db";
import { writeEstimateLines } from "@/lib/netsuite/estimates";
import type { EstimateWriteBody } from "@/lib/netsuite/types";

/**
 * Submit a configuration to NetSuite.
 * Writes line items to the associated Estimate with idempotency protection.
 */
export async function submitConfiguration(configId: string) {
  // Load full configuration
  const config = await prisma.configuration.findUnique({
    where: { id: configId },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });

  if (!config) throw new Error("Configuration not found");
  if (!config.estimateId) throw new Error("No estimate ID associated");
  if (config.lineItems.length === 0) throw new Error("No line items to submit");

  // Generate idempotency key
  const idempotencyKey = `${configId}_v${config.version}`;

  // Check if this exact version was already submitted successfully
  const existingSubmission = await prisma.submission.findUnique({
    where: { idempotencyKey },
  });

  if (existingSubmission?.status === "SUCCESS") {
    return existingSubmission;
  }

  // Create or update submission record
  const submission = existingSubmission
    ? await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          status: "IN_PROGRESS",
          attempts: { increment: 1 },
          errorMessage: null,
        },
      })
    : await prisma.submission.create({
        data: {
          configurationId: configId,
          idempotencyKey,
          version: config.version,
          requestPayload: {},
          status: "IN_PROGRESS",
          attempts: 1,
        },
      });

  // Build the payload for NetSuite
  const payload: EstimateWriteBody = {
    estimateId: config.estimateId,
    idempotencyKey,
    configVersion: config.version,
    replaceLines: true,
    lines: config.lineItems.map((li) => ({
      itemId: li.itemId,
      quantity: li.quantity,
      rate: Number(li.productPrice),
      description: li.description ?? undefined,
      customColumns: {
        custcol_box_config: true,
        custcol_tariff_pct: Number(li.tariffPercent),
        custcol_tariff_amt: Number(li.tariffAmount),
      },
    })),
    customFields: {
      ...(config.accessControlCards && {
        custbody_acs_format: config.acsFormat,
        custbody_acs_facility_code: config.acsFacilityCode,
        custbody_acs_quantity: config.acsQuantity,
        custbody_acs_start_number: config.acsStartNumber,
        custbody_acs_end_number: config.acsEndNumber,
      }),
      ...(config.licensingSSA && {
        custbody_system_id: config.systemId,
      }),
      ...(config.saas && {
        custbody_saas_term: config.saasTerm,
        custbody_saas_start_date: config.saasStartDate,
        custbody_saas_end_date: config.saasEndDate,
        custbody_saas_effective_date_notes: config.saasEffectiveDateNotes,
        custbody_saas_billing_schedule: config.saasBillingSchedule,
      }),
    },
  };

  // Store the request payload
  await prisma.submission.update({
    where: { id: submission.id },
    data: { requestPayload: payload as object },
  });

  try {
    // Write to NetSuite
    const result = await writeEstimateLines(payload);

    // Update submission with success
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: "SUCCESS",
        responsePayload: result as object,
        netsuiteEstId: result.estimateId,
      },
    });

    // Update configuration status
    await prisma.configuration.update({
      where: { id: configId },
      data: { status: "SUBMITTED" },
    });

    return updatedSubmission;
  } catch (error) {
    // Update submission with failure
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });

    // Update configuration status
    await prisma.configuration.update({
      where: { id: configId },
      data: { status: "ERROR" },
    });

    throw error;
  }
}

/**
 * Get submission status by ID.
 */
export async function getSubmissionStatus(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
  });
}
