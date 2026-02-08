import Handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/db";
import { getEstimate } from "@/lib/netsuite/estimates";
import type { ProjectLineItem, ProjectLocation, ProjectConfiguration } from "@prisma/client";

/**
 * Load an image file and convert it to a base64 data URL.
 */
function loadImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(imagePath).toLowerCase().slice(1);
    const mimeType = ext === "jpg" ? "jpeg" : ext;
    return `data:image/${mimeType};base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error(`Failed to load image: ${imagePath}`, error);
    return "";
  }
}

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
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

Handlebars.registerHelper("inc", (value: number) => value + 1);

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper("hasContent", (value: string | null | undefined) => {
  return value && value.trim().length > 0;
});

Handlebars.registerHelper("breaklines", (text: string | null | undefined) => {
  if (!text) return "";
  // Escape HTML first, then convert newlines to <br>
  const escaped = Handlebars.Utils.escapeExpression(text);
  return new Handlebars.SafeString(escaped.replace(/\n/g, "<br>"));
});

// Types for grouped materials
interface MaterialGroup {
  locationName: string;
  locationId: string | null;
  items: Array<{
    lineNumber: number;
    partNumber: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    tariffAmount: number;
    extPrice: number;
  }>;
  subtotal: number;
  tariffTotal: number;
}

interface LaborItem {
  lineNumber: number;
  category: string;
  partNumber: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  extPrice: number;
}

interface ProjectSummary {
  materialsTotal: number;
  tariffTotal: number;
  laborTotal: number;
  subtotal: number;
  indirectCost: number;
  grandTotal: number;
}

type ProjectLineItemWithLocation = ProjectLineItem & {
  location: ProjectLocation | null;
};

/**
 * Group materials (TSI_PROVIDED_PARTS and SUBCONTRACTOR_PARTS) by location.
 * Items without a location go to "Miscellaneous" group.
 * Subcontractor parts go to "Subcontractor Materials" group.
 */
function groupMaterialsByLocation(
  lineItems: ProjectLineItemWithLocation[],
  locations: ProjectLocation[]
): MaterialGroup[] {
  const materialCategories = ["TSI_PROVIDED_PARTS", "SUBCONTRACTOR_PARTS"];
  const materials = lineItems.filter((li) =>
    materialCategories.includes(li.category)
  );

  // Create location map for ordering
  const locationMap = new Map<string, ProjectLocation>();
  locations.forEach((loc) => locationMap.set(loc.id, loc));

  // Group items by location
  const groups = new Map<string, MaterialGroup>();

  materials.forEach((item) => {
    let groupKey: string;
    let groupName: string;

    if (item.category === "SUBCONTRACTOR_PARTS") {
      groupKey = "__subcontractor__";
      groupName = "Subcontractor Materials";
    } else if (item.locationId && locationMap.has(item.locationId)) {
      groupKey = item.locationId;
      groupName = locationMap.get(item.locationId)!.name;
    } else {
      groupKey = "__misc__";
      groupName = "Miscellaneous";
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        locationName: groupName,
        locationId: groupKey.startsWith("__") ? null : groupKey,
        items: [],
        subtotal: 0,
        tariffTotal: 0,
      });
    }

    const group = groups.get(groupKey)!;
    const extPrice = Number(item.totalPrice);
    const tariffAmount = Number(item.tariffAmount);

    group.items.push({
      lineNumber: item.lineNumber,
      partNumber: item.partNumber,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.productPrice),
      tariffAmount,
      extPrice,
    });

    group.subtotal += extPrice;
    group.tariffTotal += tariffAmount;
  });

  // Sort groups: locations by sortOrder first, then subcontractor, then misc
  const sortedGroups: MaterialGroup[] = [];

  // Add location groups in order
  locations.forEach((loc) => {
    if (groups.has(loc.id)) {
      sortedGroups.push(groups.get(loc.id)!);
    }
  });

  // Add subcontractor group
  if (groups.has("__subcontractor__")) {
    sortedGroups.push(groups.get("__subcontractor__")!);
  }

  // Add misc group last
  if (groups.has("__misc__")) {
    sortedGroups.push(groups.get("__misc__")!);
  }

  return sortedGroups;
}

/**
 * Consolidate all labor items into a single list.
 */
function consolidateLaborItems(lineItems: ProjectLineItemWithLocation[]): LaborItem[] {
  const laborCategories = [
    "INSTALLATION_LABOR",
    "SUBCONTRACTOR_LABOR",
    "PROJECT_MANAGEMENT",
    "MISC_LABOR",
    "TRAVEL_COSTS",
  ];

  const categoryLabels: Record<string, string> = {
    INSTALLATION_LABOR: "Installation Labor",
    SUBCONTRACTOR_LABOR: "Subcontractor Labor",
    PROJECT_MANAGEMENT: "Project Management",
    MISC_LABOR: "Miscellaneous Labor",
    TRAVEL_COSTS: "Travel Costs",
  };

  return lineItems
    .filter((li) => laborCategories.includes(li.category))
    .map((item) => ({
      lineNumber: item.lineNumber,
      category: categoryLabels[item.category] || item.category,
      partNumber: item.partNumber,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.productPrice),
      extPrice: Number(item.totalPrice),
    }));
}

/**
 * Compute project financial summary.
 */
function computeProjectSummary(
  lineItems: ProjectLineItemWithLocation[],
  indirectCost: number
): ProjectSummary {
  const materialCategories = ["TSI_PROVIDED_PARTS", "SUBCONTRACTOR_PARTS"];
  const laborCategories = [
    "INSTALLATION_LABOR",
    "SUBCONTRACTOR_LABOR",
    "PROJECT_MANAGEMENT",
    "MISC_LABOR",
    "TRAVEL_COSTS",
  ];

  let materialsTotal = 0;
  let tariffTotal = 0;
  let laborTotal = 0;

  lineItems.forEach((item) => {
    const totalPrice = Number(item.totalPrice);
    const tariffAmount = Number(item.tariffAmount);

    if (materialCategories.includes(item.category)) {
      materialsTotal += totalPrice;
      tariffTotal += tariffAmount;
    } else if (laborCategories.includes(item.category)) {
      laborTotal += totalPrice;
    }
  });

  const subtotal = materialsTotal + laborTotal;
  const grandTotal = subtotal + indirectCost;

  return {
    materialsTotal,
    tariffTotal,
    laborTotal,
    subtotal,
    indirectCost,
    grandTotal,
  };
}

/**
 * Add days to a date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate a project proposal PDF.
 * Returns the PDF as a Buffer.
 */
export async function generateProjectProposal(configId: string): Promise<Buffer> {
  // Load configuration with line items and locations
  const config = await prisma.projectConfiguration.findUnique({
    where: { id: configId },
    include: {
      lineItems: {
        orderBy: { lineNumber: "asc" },
        include: { location: true },
      },
      locations: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!config) throw new Error("Project configuration not found");

  // Fetch NetSuite estimate data for customer/sales rep info
  let estimateData = null;
  if (config.estimateId) {
    try {
      estimateData = await getEstimate(config.estimateId);
    } catch (error) {
      console.error("Failed to fetch estimate data for proposal:", error);
    }
  }

  // Group materials by location
  const materialsByLocation = groupMaterialsByLocation(
    config.lineItems,
    config.locations
  );

  // Consolidate labor items
  const laborItems = consolidateLaborItems(config.lineItems);

  // Compute financial summary
  const summary = computeProjectSummary(
    config.lineItems,
    Number(config.indirectCost)
  );

  // Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "project-proposal.hbs"
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSource);

  // Prepare template data
  const generatedDate = new Date();
  const validUntilDate = addDays(generatedDate, 30);

  // Load images as base64 for embedding in PDF
  const images = {
    header: loadImageAsBase64("images/proposal/header.jpg"),
    footer: loadImageAsBase64("images/proposal/footer.jpg"),
    titlePage: loadImageAsBase64("images/proposal/title-page.jpg"),
  };

  const templateData = {
    generatedDate: generatedDate.toISOString(),
    validUntilDate: validUntilDate.toISOString(),
    config: {
      ...config,
      indirectCost: Number(config.indirectCost),
      focusAmount: config.focusAmount ? Number(config.focusAmount) : null,
      defaultMargin: Number(config.defaultMargin),
    },
    estimate: estimateData?.estimate,
    customer: estimateData?.customer,
    materialsByLocation,
    laborItems,
    summary,
    images,
    // Computed flags for conditional sections
    showProServicesScope:
      config.proServicesOrSA && config.proServicesScope?.trim(),
    showSolutionsArchitectScope:
      config.proServicesOrSA && config.solutionsArchitectScope?.trim(),
    showFocusScope:
      config.postInstallPlan === "FOCUS" && config.focusScope?.trim(),
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

    // Build header/footer templates with embedded images
    // Note: Puppeteer header/footer templates require -webkit-print-color-adjust and explicit font-size
    const headerTemplate = images.header
      ? `<style>
          html, body { margin: 0 !important; padding: 0 !important; }
          .header-container { width: 100%; height: 80px; margin: 0; padding: 0; overflow: hidden; }
          .header-container img { width: 100%; height: 80px; object-fit: cover; object-position: top center; display: block; }
        </style>
        <div class="header-container">
          <img src="${images.header}" />
        </div>`
      : "<div></div>";

    const footerTemplate = images.footer
      ? `<style>
          html, body { margin: 0 !important; padding: 0 !important; }
          .footer-container { width: 100%; height: 70px; margin: 0; padding: 0; overflow: hidden; }
          .footer-container img { width: 100%; height: 70px; object-fit: cover; object-position: bottom center; display: block; }
        </style>
        <div class="footer-container">
          <img src="${images.footer}" />
        </div>`
      : "<div></div>";

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "90px",
        right: "0",
        bottom: "80px",
        left: "0",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
