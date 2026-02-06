/**
 * Mock NetSuite responses for local development.
 * Enabled via NETSUITE_MOCK=true environment variable.
 */

import type { NetSuiteItemResult, EstimateFetchResult, EstimateWriteResult } from "./types";

const MOCK_ITEMS: NetSuiteItemResult[] = [
  // Intrusion Detection - Sensors
  {
    internalId: "1001",
    itemId: "0-102023",
    displayName: "PowerG 2-Way Door/Window Contact Transmitter",
    description: "PowerG 2-Way Door/Window Contact Transmitter with second Hardwired Input",
    manufacturer: "Visonic Americas",
    itemType: "inventoryItem",
    isActive: true,
    cost: 57.63,
    basePrice: 82.33,
    quantityAvailable: 150,
  },
  {
    internalId: "1002",
    itemId: "0-103045",
    displayName: "PowerG Wireless Motion Detector",
    description: "PowerG Wireless PIR Motion Detector with Anti-Mask",
    manufacturer: "Visonic Americas",
    itemType: "inventoryItem",
    isActive: true,
    cost: 42.15,
    basePrice: 60.21,
    quantityAvailable: 200,
  },
  {
    internalId: "1003",
    itemId: "HSM2HOST9",
    displayName: "PowerSeries Neo Host Interface Module",
    description: "PowerSeries Neo Integration Module for third-party monitoring",
    manufacturer: "DSC",
    itemType: "inventoryItem",
    isActive: true,
    cost: 89.50,
    basePrice: 127.86,
    quantityAvailable: 45,
  },
  {
    internalId: "1004",
    itemId: "PG9914",
    displayName: "PowerG Wireless Mirror Motion Detector",
    description: "PowerG 915MHz Wireless Mirror Optic Motion Detector",
    manufacturer: "DSC",
    itemType: "inventoryItem",
    isActive: true,
    cost: 64.20,
    basePrice: 91.71,
    quantityAvailable: 80,
  },
  {
    internalId: "1005",
    itemId: "HS2016NK",
    displayName: "PowerSeries Neo 16-Zone Alarm Panel",
    description: "PowerSeries Neo 6 to 16-Zone Alarm Control Panel",
    manufacturer: "DSC",
    itemType: "inventoryItem",
    isActive: true,
    cost: 125.00,
    basePrice: 178.57,
    quantityAvailable: 30,
  },
  {
    internalId: "1006",
    itemId: "CAB-CAT6-100",
    displayName: "CAT6 Cable 100ft",
    description: "Category 6 Ethernet Cable, 100 feet, Blue",
    manufacturer: "Generic",
    itemType: "nonInventoryItem",
    isActive: true,
    cost: 15.50,
    basePrice: 22.14,
    quantityAvailable: 500,
  },
  {
    internalId: "1007",
    itemId: "SVC-INSTALL-HR",
    displayName: "Installation Service - Per Hour",
    description: "Professional installation service, billed per hour",
    manufacturer: "",
    itemType: "serviceItem",
    isActive: true,
    cost: 45.00,
    basePrice: 85.00,
  },
  {
    internalId: "1008",
    itemId: "PG9944",
    displayName: "PowerG Wireless Outdoor Motion Detector",
    description: "PowerG 915MHz Wireless Outdoor Dual-Tech Motion Detector",
    manufacturer: "DSC",
    itemType: "inventoryItem",
    isActive: true,
    cost: 95.30,
    basePrice: 136.14,
    quantityAvailable: 25,
  },

  // Access Control - Readers & Controllers
  {
    internalId: "2001",
    itemId: "AC-RDR-PROX",
    displayName: "Proximity Card Reader",
    description: "Mullion-mount proximity card reader, 125kHz, Wiegand output",
    manufacturer: "HID Global",
    itemType: "inventoryItem",
    isActive: true,
    cost: 85.00,
    basePrice: 121.43,
    quantityAvailable: 75,
  },
  {
    internalId: "2002",
    itemId: "AC-RDR-SMART",
    displayName: "iCLASS SE Smart Card Reader",
    description: "Multi-technology reader supporting iCLASS, SEOS, and Mobile credentials",
    manufacturer: "HID Global",
    itemType: "inventoryItem",
    isActive: true,
    cost: 195.00,
    basePrice: 278.57,
    quantityAvailable: 40,
  },
  {
    internalId: "2003",
    itemId: "AC-CTRL-2DR",
    displayName: "2-Door Access Controller",
    description: "IP-based 2-door access control panel with PoE support",
    manufacturer: "Mercury Security",
    itemType: "inventoryItem",
    isActive: true,
    cost: 425.00,
    basePrice: 607.14,
    quantityAvailable: 20,
  },
  {
    internalId: "2004",
    itemId: "AC-CTRL-4DR",
    displayName: "4-Door Access Controller",
    description: "IP-based 4-door access control panel with integrated I/O",
    manufacturer: "Mercury Security",
    itemType: "inventoryItem",
    isActive: true,
    cost: 625.00,
    basePrice: 892.86,
    quantityAvailable: 15,
  },
  {
    internalId: "2005",
    itemId: "AC-CARD-PROX-100",
    displayName: "Proximity Cards (100 pack)",
    description: "HID 1386 ISOProx II proximity cards, 100 per box",
    manufacturer: "HID Global",
    itemType: "inventoryItem",
    isActive: true,
    cost: 95.00,
    basePrice: 135.71,
    quantityAvailable: 500,
  },
  {
    internalId: "2006",
    itemId: "AC-CARD-SMART-100",
    displayName: "Smart Cards (100 pack)",
    description: "iCLASS SEOS 8K smart cards, 100 per box",
    manufacturer: "HID Global",
    itemType: "inventoryItem",
    isActive: true,
    cost: 450.00,
    basePrice: 642.86,
    quantityAvailable: 200,
  },

  // Video Surveillance - Cameras
  {
    internalId: "3001",
    itemId: "CAM-DOME-4MP",
    displayName: "4MP Indoor Dome Camera",
    description: "4MP PoE dome camera with IR night vision, 2.8mm lens",
    manufacturer: "Axis Communications",
    itemType: "inventoryItem",
    isActive: true,
    cost: 275.00,
    basePrice: 392.86,
    quantityAvailable: 60,
  },
  {
    internalId: "3002",
    itemId: "CAM-BULLET-8MP",
    displayName: "8MP Outdoor Bullet Camera",
    description: "8MP PoE bullet camera with 50m IR, IP67 weatherproof",
    manufacturer: "Axis Communications",
    itemType: "inventoryItem",
    isActive: true,
    cost: 485.00,
    basePrice: 692.86,
    quantityAvailable: 35,
  },
  {
    internalId: "3003",
    itemId: "CAM-PTZ-4K",
    displayName: "4K PTZ Camera",
    description: "4K Pan-Tilt-Zoom camera with 25x optical zoom, analytics",
    manufacturer: "Axis Communications",
    itemType: "inventoryItem",
    isActive: true,
    cost: 1850.00,
    basePrice: 2642.86,
    quantityAvailable: 10,
  },
  {
    internalId: "3004",
    itemId: "NVR-16CH",
    displayName: "16-Channel NVR",
    description: "16-channel network video recorder, 8TB storage, 4K output",
    manufacturer: "Hanwha Techwin",
    itemType: "inventoryItem",
    isActive: true,
    cost: 895.00,
    basePrice: 1278.57,
    quantityAvailable: 12,
  },
  {
    internalId: "3005",
    itemId: "NVR-32CH",
    displayName: "32-Channel NVR",
    description: "32-channel network video recorder, 16TB RAID storage",
    manufacturer: "Hanwha Techwin",
    itemType: "inventoryItem",
    isActive: true,
    cost: 1650.00,
    basePrice: 2357.14,
    quantityAvailable: 8,
  },

  // Networking & Infrastructure
  {
    internalId: "4001",
    itemId: "SW-POE-8",
    displayName: "8-Port PoE+ Switch",
    description: "8-port Gigabit PoE+ switch, 120W power budget",
    manufacturer: "Cisco",
    itemType: "inventoryItem",
    isActive: true,
    cost: 185.00,
    basePrice: 264.29,
    quantityAvailable: 50,
  },
  {
    internalId: "4002",
    itemId: "SW-POE-24",
    displayName: "24-Port PoE+ Switch",
    description: "24-port Gigabit managed PoE+ switch, 370W power budget",
    manufacturer: "Cisco",
    itemType: "inventoryItem",
    isActive: true,
    cost: 495.00,
    basePrice: 707.14,
    quantityAvailable: 25,
  },
  {
    internalId: "4003",
    itemId: "CAB-CAT6-50",
    displayName: "CAT6 Cable 50ft",
    description: "Category 6 Ethernet Cable, 50 feet, Blue",
    manufacturer: "Generic",
    itemType: "nonInventoryItem",
    isActive: true,
    cost: 8.50,
    basePrice: 12.14,
    quantityAvailable: 1000,
  },
  {
    internalId: "4004",
    itemId: "CAB-CAT6-25",
    displayName: "CAT6 Cable 25ft",
    description: "Category 6 Ethernet Cable, 25 feet, Blue",
    manufacturer: "Generic",
    itemType: "nonInventoryItem",
    isActive: true,
    cost: 4.75,
    basePrice: 6.79,
    quantityAvailable: 1500,
  },
  {
    internalId: "4005",
    itemId: "UPS-1500VA",
    displayName: "1500VA UPS",
    description: "1500VA/900W Line-Interactive UPS with LCD display",
    manufacturer: "APC",
    itemType: "inventoryItem",
    isActive: true,
    cost: 195.00,
    basePrice: 278.57,
    quantityAvailable: 30,
  },

  // Software & Licensing
  {
    internalId: "5001",
    itemId: "LIC-VMS-CAM",
    displayName: "VMS Camera License",
    description: "Video management software license, per camera, perpetual",
    manufacturer: "Milestone",
    itemType: "nonInventoryItem",
    isActive: true,
    cost: 125.00,
    basePrice: 178.57,
  },
  {
    internalId: "5002",
    itemId: "LIC-ACS-DOOR",
    displayName: "Access Control Door License",
    description: "Access control software license, per door, perpetual",
    manufacturer: "Genetec",
    itemType: "nonInventoryItem",
    isActive: true,
    cost: 175.00,
    basePrice: 250.00,
  },
  {
    internalId: "5003",
    itemId: "SSA-VMS-1YR",
    displayName: "VMS Software Support - 1 Year",
    description: "Annual software support agreement for VMS per camera",
    manufacturer: "Milestone",
    itemType: "serviceItem",
    isActive: true,
    cost: 25.00,
    basePrice: 35.71,
  },
  {
    internalId: "5004",
    itemId: "SAAS-CLOUD-MO",
    displayName: "Cloud Monitoring - Monthly",
    description: "Cloud-based monitoring and management service, per device per month",
    manufacturer: "Internal",
    itemType: "serviceItem",
    isActive: true,
    cost: 5.00,
    basePrice: 9.99,
  },

  // Services
  {
    internalId: "6001",
    itemId: "SVC-PROGRAM-HR",
    displayName: "Programming Service - Per Hour",
    description: "System programming and configuration service",
    manufacturer: "",
    itemType: "serviceItem",
    isActive: true,
    cost: 55.00,
    basePrice: 95.00,
  },
  {
    internalId: "6002",
    itemId: "SVC-TRAINING-DAY",
    displayName: "On-Site Training - Per Day",
    description: "On-site end user training, full day",
    manufacturer: "",
    itemType: "serviceItem",
    isActive: true,
    cost: 400.00,
    basePrice: 750.00,
  },
  {
    internalId: "6003",
    itemId: "SVC-PM-ANNUAL",
    displayName: "Annual Preventive Maintenance",
    description: "Annual preventive maintenance visit including inspection and testing",
    manufacturer: "",
    itemType: "serviceItem",
    isActive: true,
    cost: 350.00,
    basePrice: 595.00,
  },

  // Enclosures & Mounting
  {
    internalId: "7001",
    itemId: "ENC-PANEL-LG",
    displayName: "Large Control Panel Enclosure",
    description: "Steel enclosure for control panels, 24x24x8 inches",
    manufacturer: "Altronix",
    itemType: "inventoryItem",
    isActive: true,
    cost: 85.00,
    basePrice: 121.43,
    quantityAvailable: 40,
  },
  {
    internalId: "7002",
    itemId: "MNT-POLE-CAM",
    displayName: "Camera Pole Mount Adapter",
    description: "Stainless steel pole mount adapter for outdoor cameras",
    manufacturer: "Axis Communications",
    itemType: "inventoryItem",
    isActive: true,
    cost: 45.00,
    basePrice: 64.29,
    quantityAvailable: 100,
  },
  {
    internalId: "7003",
    itemId: "MNT-CORNER-CAM",
    displayName: "Camera Corner Mount",
    description: "Corner mount bracket for dome cameras",
    manufacturer: "Axis Communications",
    itemType: "inventoryItem",
    isActive: true,
    cost: 35.00,
    basePrice: 50.00,
    quantityAvailable: 80,
  },
];

const MOCK_ESTIMATE: EstimateFetchResult = {
  estimate: {
    internalId: "12345",
    tranId: "EST-00456",
    status: "Open",
    salesRep: "John Smith",
    salesRepEmail: "jsmith@company.com",
    tranDate: new Date().toISOString().split("T")[0],
  },
  customer: {
    internalId: "5001",
    name: "Acme Security Solutions",
    email: "purchasing@acmesecurity.com",
    phone: "(555) 123-4567",
    billingAddress: {
      addressee: "Acme Security Solutions",
      addr1: "123 Main Street",
      addr2: "Suite 200",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      country: "US",
    },
    shippingAddress: {
      addressee: "Acme Security Solutions",
      addr1: "456 Warehouse Blvd",
      city: "Dallas",
      state: "TX",
      zip: "75202",
      country: "US",
    },
  },
};

export function mockSearchItems(
  query: string,
  limit: number = 25,
  offset: number = 0
): { items: NetSuiteItemResult[]; total: number; hasMore: boolean } {
  const q = query.toLowerCase();
  const filtered = MOCK_ITEMS.filter(
    (item) =>
      item.itemId.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q)
  );

  const paginated = filtered.slice(offset, offset + limit);

  return {
    items: paginated,
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
}

export function mockSearchItemsWithFilters(
  query: string,
  filters: {
    itemTypes?: string[];
    nameContains?: string[];
    nameExcludes?: string[];
    manufacturers?: string[];
    costMin?: number | null;
    costMax?: number | null;
  },
  limit: number = 25,
  offset: number = 0
): { items: NetSuiteItemResult[]; total: number; hasMore: boolean } {
  const q = query.toLowerCase();

  const filtered = MOCK_ITEMS.filter((item) => {
    // Text search first
    const matchesQuery =
      !q ||
      item.itemId.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    // Item type filter
    if (filters.itemTypes?.length) {
      if (!filters.itemTypes.includes(item.itemType)) {
        return false;
      }
    }

    // Name contains filter (OR logic - match any pattern)
    if (filters.nameContains?.length) {
      const nameMatch = filters.nameContains.some(
        (pattern) =>
          item.displayName.toLowerCase().includes(pattern.toLowerCase()) ||
          item.itemId.toLowerCase().includes(pattern.toLowerCase()) ||
          item.description?.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!nameMatch) return false;
    }

    // Name excludes filter (AND logic - exclude all patterns)
    if (filters.nameExcludes?.length) {
      const excluded = filters.nameExcludes.some(
        (pattern) =>
          item.displayName.toLowerCase().includes(pattern.toLowerCase()) ||
          item.itemId.toLowerCase().includes(pattern.toLowerCase())
      );
      if (excluded) return false;
    }

    // Manufacturer filter
    if (filters.manufacturers?.length) {
      if (!filters.manufacturers.includes(item.manufacturer)) {
        return false;
      }
    }

    // Cost range filter
    if (filters.costMin != null && item.cost < filters.costMin) {
      return false;
    }
    if (filters.costMax != null && item.cost > filters.costMax) {
      return false;
    }

    return true;
  });

  const paginated = filtered.slice(offset, offset + limit);

  return {
    items: paginated,
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
}

export function mockGetItem(
  itemId: string
): NetSuiteItemResult | null {
  return (
    MOCK_ITEMS.find(
      (item) => item.internalId === itemId || item.itemId === itemId
    ) ?? null
  );
}

export function mockGetEstimate(
  estimateId: string
): EstimateFetchResult {
  return {
    ...MOCK_ESTIMATE,
    estimate: {
      ...MOCK_ESTIMATE.estimate,
      internalId: estimateId,
    },
  };
}

export function mockWriteEstimateLines(
  estimateId: string,
  idempotencyKey: string,
  lineCount: number
): EstimateWriteResult {
  return {
    success: true,
    estimateId,
    lineCount,
    warnings: [],
    idempotencyKey,
  };
}
