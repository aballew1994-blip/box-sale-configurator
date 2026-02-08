import Handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { getEstimate } from "@/lib/netsuite/estimates";
import { computeConfigSummary } from "@/lib/utils/calculations";

// Register Handlebars helpers
Handlebars.registerHelper("formatCurrency", (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
});

Handlebars.registerHelper("formatPercent", (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
});

Handlebars.registerHelper("formatDate", (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

Handlebars.registerHelper("inc", (value: number) => value + 1);

/**
 * Generate a proposal PDF for a configuration.
 * Returns the PDF as a Buffer.
 */
export async function generateProposal(configId: string): Promise<Buffer> {
  // Load configuration
  const config = await prisma.configuration.findUnique({
    where: { id: configId },
    include: { lineItems: { orderBy: { lineNumber: "asc" } } },
  });

  if (!config) throw new Error("Configuration not found");

  // Fetch NetSuite data for the proposal
  let estimateData = null;
  if (config.estimateId) {
    try {
      estimateData = await getEstimate(config.estimateId);
    } catch (error) {
      console.error("Failed to fetch estimate data for proposal:", error);
    }
  }

  // Compute summary
  const summary = computeConfigSummary({
    lineItems: config.lineItems.map((li) => ({
      extCost: Number(li.extCost),
      totalPrice: Number(li.totalPrice),
      quantity: li.quantity,
    })),
    shippingFee: Number(config.shippingFee),
    shippingOverride: config.shippingOverride,
  });

  // Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "proposal.hbs"
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

  // Prepare template data
  const templateData = {
    generatedDate: new Date().toISOString(),
    config: {
      ...config,
      defaultMargin: Number(config.defaultMargin),
      shippingFee: Number(config.shippingFee),
    },
    lineItems: config.lineItems.map((li) => ({
      ...li,
      unitCost: Number(li.unitCost),
      productPrice: Number(li.productPrice),
      extCost: Number(li.extCost),
      totalPrice: Number(li.totalPrice),
      margin: Number(li.margin),
      tariffPercent: Number(li.tariffPercent),
      tariffAmount: Number(li.tariffAmount),
    })),
    estimate: estimateData?.estimate,
    customer: estimateData?.customer,
    summary,
  };

  // Render HTML
  const html = template(templateData);

  // Generate PDF with Puppeteer
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome", // Use installed Chrome instead of bundled Chromium
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    timeout: 60000,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.75in",
        left: "0.5in",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
