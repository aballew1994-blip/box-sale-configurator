"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";
import { useWizard } from "./WizardContext";
import { PreviewSection } from "./PreviewSection";
import { MATERIAL_CATEGORIES, LABOR_CATEGORIES, CATEGORY_LABELS } from "./constants";

interface WizardDocumentPreviewProps {
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function WizardDocumentPreview({ onConfigUpdate }: WizardDocumentPreviewProps) {
  const {
    config,
    sections,
    sectionValues,
    currentSectionIndex,
    skippedSections,
    goToSection,
  } = useWizard();

  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const previewRef = useRef<HTMLDivElement>(null);
  const [consolidateLabor, setConsolidateLabor] = useState(config.consolidateLabor ?? false);

  // Editable field states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [contactFirstName, setContactFirstName] = useState(config.contactFirstName || "");
  const [contactLastName, setContactLastName] = useState(config.contactLastName || "");
  const [contactEmail, setContactEmail] = useState(config.contactEmail || "");
  const [siteAddress, setSiteAddress] = useState(config.siteAddressOverride || "");
  const [billingAddress, setBillingAddress] = useState(config.billingAddressOverride || "");
  const [isSaving, setIsSaving] = useState(false);

  // Mutation for saving field updates
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => {
      onConfigUpdate(data.configuration);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  const saveField = useCallback(
    (field: string, value: string | null) => {
      setIsSaving(true);
      mutation.mutate({ [field]: value });
    },
    [mutation]
  );

  const handleFieldBlur = useCallback(
    (field: string, value: string) => {
      setEditingField(null);
      saveField(field, value || null);
    },
    [saveField]
  );

  // Auto-scroll to active section
  useEffect(() => {
    const currentSection = sections[currentSectionIndex];
    if (currentSection) {
      const ref = sectionRefs.current.get(currentSection.key);
      if (ref && previewRef.current) {
        const container = previewRef.current;
        const element = ref;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Only scroll if element is not fully visible
        if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentSectionIndex, sections]);

  // Calculate materials and labor summaries
  const lineItems = config.lineItems || [];
  const locations = config.locations || [];

  const materialsTotal = lineItems
    .filter((item) => MATERIAL_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const laborTotal = lineItems
    .filter((item) => LABOR_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + Number(item.totalPrice), 0);

  const tariffTotal = lineItems.reduce((sum, item) => sum + Number(item.tariffAmount || 0), 0);

  const grandTotal = materialsTotal + laborTotal + Number(config.indirectCost || 0);

  // Group materials by location with individual items
  type MaterialItem = {
    id: string;
    partNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tariffAmount: number;
    totalPrice: number;
  };

  const materialsByLocation = new Map<string, {
    name: string;
    sortOrder: number;
    items: MaterialItem[];
    total: number;
  }>();
  const unassignedTSIMaterials: MaterialItem[] = [];
  const subcontractorMaterials: MaterialItem[] = [];

  lineItems
    .filter((item) => MATERIAL_CATEGORIES.includes(item.category))
    .forEach((item) => {
      const materialItem: MaterialItem = {
        id: item.id,
        partNumber: item.partNumber || "",
        description: item.description || "",
        quantity: item.quantity,
        unitPrice: Number(item.productPrice),
        tariffAmount: Number(item.tariffAmount || 0),
        totalPrice: Number(item.totalPrice),
      };

      // Subcontractor parts go to their own section
      if (item.category === "SUBCONTRACTOR_PARTS") {
        subcontractorMaterials.push(materialItem);
        return;
      }

      // TSI Provided Parts - group by location
      if (item.locationId) {
        const location = locations.find((l) => l.id === item.locationId);
        if (location) {
          const existing = materialsByLocation.get(item.locationId);
          if (existing) {
            existing.items.push(materialItem);
            existing.total += materialItem.totalPrice;
          } else {
            materialsByLocation.set(item.locationId, {
              name: location.name,
              sortOrder: location.sortOrder || 0,
              items: [materialItem],
              total: materialItem.totalPrice,
            });
          }
        } else {
          unassignedTSIMaterials.push(materialItem);
        }
      } else {
        unassignedTSIMaterials.push(materialItem);
      }
    });

  const unassignedTSIMaterialsTotal = unassignedTSIMaterials.reduce((sum, item) => sum + item.totalPrice, 0);
  const subcontractorMaterialsTotal = subcontractorMaterials.reduce((sum, item) => sum + item.totalPrice, 0);

  // Group labor by category
  const laborByCategory = new Map<string, { total: number; count: number }>();
  lineItems
    .filter((item) => LABOR_CATEGORIES.includes(item.category))
    .forEach((item) => {
      const total = Number(item.totalPrice);
      const existing = laborByCategory.get(item.category);
      if (existing) {
        existing.total += total;
        existing.count += 1;
      } else {
        laborByCategory.set(item.category, { total, count: 1 });
      }
    });

  const proposalDate = new Date();
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  return (
    <div
      ref={previewRef}
      className="h-full overflow-y-auto bg-white rounded-lg border border-border shadow-lg"
    >
      {/* ===== COVER PAGE ===== */}
      <div className="min-h-[600px] flex flex-col">
        {/* Header - Actual image */}
        <img
          src="/images/proposal/header.jpg"
          alt="TSI Header"
          className="w-full h-auto"
        />

        {/* Red Banner with Estimate Number */}
        <div className="bg-[#dc2626] text-white px-4 py-2 flex items-center justify-between relative z-10">
          <span className="font-bold text-sm tracking-wide">
            {config.estimateNumber || "DRAFT"}
          </span>
          <span className="text-sm">Project Proposal</span>
        </div>

        {/* Cover Content */}
        <div className="flex-1 p-6">
          {/* Customer Name */}
          <h1 className="text-2xl font-bold text-[#1a365d] mb-2">
            {config.customerName || "Customer Name"}
          </h1>

          {/* Address placeholder */}
          <p className="text-sm text-gray-500 mb-6">
            Customer address will appear here
          </p>

          {/* Dates */}
          <div className="flex gap-8 mb-6">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Proposal Issued</div>
              <div className="text-sm font-semibold text-[#1a365d]">{formatDate(proposalDate)}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Valid Until</div>
              <div className="text-sm font-semibold text-[#1a365d]">{formatDate(validUntilDate)}</div>
            </div>
          </div>

          {/* Hero Image - Actual image */}
          <div className="rounded-lg mb-6 overflow-hidden">
            <img
              src="/images/proposal/title-page.jpg"
              alt="Project Site"
              className="w-full h-auto"
            />
          </div>

          {/* Prepared By */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Prepared By</div>
            <div className="font-semibold text-[#1a365d]">TSI Account Team</div>
            <div className="text-xs text-gray-500">Account Manager</div>
          </div>
        </div>

        {/* Footer - Actual image */}
        <img
          src="/images/proposal/footer.jpg"
          alt="TSI Footer"
          className="w-full h-auto mt-auto"
        />
      </div>

      {/* ===== PAGE DIVIDER ===== */}
      <div className="border-t-4 border-dashed border-gray-300 my-2 mx-4" />

      {/* ===== STATEMENT OF WORK PAGE ===== */}

      {/* Header - Actual image */}
      <img
        src="/images/proposal/header.jpg"
        alt="TSI Header"
        className="w-full h-auto"
      />

      {/* Page Header */}
      <div className="bg-[#dc2626] text-white px-4 py-2 flex items-center justify-between">
        <span className="font-bold text-sm tracking-wide">
          {config.estimateNumber || "DRAFT"}
        </span>
        <span className="text-sm">Statement of Work</span>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-1">
        {sections.map((section, index) => (
          <PreviewSection
            key={section.key}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.key, el);
            }}
            section={section}
            content={sectionValues[section.field] || ""}
            isActive={index === currentSectionIndex}
            isSkipped={skippedSections.has(section.key)}
            onClick={() => goToSection(index)}
          />
        ))}
      </div>

      {/* Footer - Actual image */}
      <img
        src="/images/proposal/footer.jpg"
        alt="TSI Footer"
        className="w-full h-auto mt-4"
      />

      {/* ===== PAGE DIVIDER ===== */}
      <div className="border-t-4 border-dashed border-gray-300 my-2 mx-4" />

      {/* ===== PROPOSAL DETAILS PAGE ===== */}

      {/* Header - Actual image */}
      <img
        src="/images/proposal/header.jpg"
        alt="TSI Header"
        className="w-full h-auto"
      />

      {/* Page Header */}
      <div className="bg-[#dc2626] text-white px-4 py-2 flex items-center justify-between">
        <span className="font-bold text-sm tracking-wide">
          {config.estimateNumber || "DRAFT"}
        </span>
        <span className="text-sm">Proposal Details</span>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold text-[#1a365d] border-b-[3px] border-[#1a365d] pb-2 mb-4">
          Proposal Details
        </h2>

        {/* Contact Info Grid - Editable */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
          {/* Site Address */}
          <div className="group">
            <div className="font-semibold text-[#1a365d] text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
              Site Address
              {isSaving && editingField === "siteAddressOverride" && (
                <span className="text-[8px] text-gray-400 font-normal">Saving...</span>
              )}
            </div>
            {editingField === "siteAddressOverride" ? (
              <textarea
                autoFocus
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                onBlur={() => handleFieldBlur("siteAddressOverride", siteAddress)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSiteAddress(config.siteAddressOverride || "");
                    setEditingField(null);
                  }
                }}
                className="w-full text-[10px] border border-primary rounded px-1.5 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Enter site address..."
              />
            ) : (
              <div
                onClick={() => setEditingField("siteAddressOverride")}
                className="text-gray-600 cursor-pointer hover:bg-primary/5 rounded px-1.5 py-1 -mx-1.5 -my-1 transition-colors min-h-[40px] whitespace-pre-wrap"
              >
                {siteAddress || (
                  <span className="italic text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Click to add
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Billing Address */}
          <div className="group">
            <div className="font-semibold text-[#1a365d] text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
              Billing Address
              {isSaving && editingField === "billingAddressOverride" && (
                <span className="text-[8px] text-gray-400 font-normal">Saving...</span>
              )}
            </div>
            {editingField === "billingAddressOverride" ? (
              <textarea
                autoFocus
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                onBlur={() => handleFieldBlur("billingAddressOverride", billingAddress)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setBillingAddress(config.billingAddressOverride || "");
                    setEditingField(null);
                  }
                }}
                className="w-full text-[10px] border border-primary rounded px-1.5 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Enter billing address..."
              />
            ) : (
              <div
                onClick={() => setEditingField("billingAddressOverride")}
                className="text-gray-600 cursor-pointer hover:bg-primary/5 rounded px-1.5 py-1 -mx-1.5 -my-1 transition-colors min-h-[40px] whitespace-pre-wrap"
              >
                {billingAddress || (
                  <span className="italic text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Click to add
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="group">
            <div className="font-semibold text-[#1a365d] text-[10px] uppercase tracking-wide mb-1 flex items-center gap-1">
              Contact
              {isSaving && (editingField === "contactFirstName" || editingField === "contactLastName" || editingField === "contactEmail") && (
                <span className="text-[8px] text-gray-400 font-normal">Saving...</span>
              )}
            </div>
            {editingField === "contact" ? (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    onBlur={() => handleFieldBlur("contactFirstName", contactFirstName)}
                    placeholder="First name"
                    className="flex-1 text-[10px] border border-primary rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    onBlur={() => handleFieldBlur("contactLastName", contactLastName)}
                    placeholder="Last name"
                    className="flex-1 text-[10px] border border-primary rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  onBlur={() => {
                    handleFieldBlur("contactEmail", contactEmail);
                    setEditingField(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setContactFirstName(config.contactFirstName || "");
                      setContactLastName(config.contactLastName || "");
                      setContactEmail(config.contactEmail || "");
                      setEditingField(null);
                    }
                    if (e.key === "Enter") {
                      handleFieldBlur("contactEmail", contactEmail);
                      setEditingField(null);
                    }
                  }}
                  placeholder="Email address"
                  className="w-full text-[10px] border border-primary rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <div
                onClick={() => setEditingField("contact")}
                className="text-gray-600 cursor-pointer hover:bg-primary/5 rounded px-1.5 py-1 -mx-1.5 -my-1 transition-colors min-h-[40px]"
              >
                {contactFirstName || contactLastName || contactEmail ? (
                  <>
                    {(contactFirstName || contactLastName) && (
                      <div>{contactFirstName} {contactLastName}</div>
                    )}
                    {contactEmail && (
                      <div className="text-gray-500">{contactEmail}</div>
                    )}
                  </>
                ) : (
                  <span className="italic text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Click to add
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Materials by Location */}
        {materialsByLocation.size > 0 || unassignedTSIMaterials.length > 0 || subcontractorMaterials.length > 0 ? (
          <div className="space-y-4 mb-4">
            {Array.from(materialsByLocation.entries())
              .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
              .map(([locationId, locationData]) => (
                <div key={locationId}>
                  <div className="bg-[#1a365d] text-white px-3 py-2 text-xs font-semibold flex justify-between">
                    <span>{locationData.name}</span>
                    <span>{formatCurrency(locationData.total)}</span>
                  </div>
                  <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-2 py-1 font-semibold text-gray-600 w-10">QTY</th>
                        <th className="text-left px-2 py-1 font-semibold text-gray-600 w-20">ITEM</th>
                        <th className="text-left px-2 py-1 font-semibold text-gray-600">DESCRIPTION</th>
                        <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">UNIT</th>
                        <th className="text-right px-2 py-1 font-semibold text-gray-600 w-14">TARIFF</th>
                        <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">EXT.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationData.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-2 py-1 text-center">{item.quantity}</td>
                          <td className="px-2 py-1 truncate max-w-[80px]" title={item.partNumber}>{item.partNumber}</td>
                          <td className="px-2 py-1 truncate max-w-[150px]" title={item.description}>{item.description}</td>
                          <td className="px-2 py-1 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-2 py-1 text-right">{formatCurrency(item.tariffAmount)}</td>
                          <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            {/* Unassigned TSI Materials */}
            {unassignedTSIMaterials.length > 0 && (
              <div>
                <div className="bg-gray-400 text-white px-3 py-2 text-xs font-semibold flex justify-between">
                  <span>Unassigned</span>
                  <span>{formatCurrency(unassignedTSIMaterialsTotal)}</span>
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600 w-10">QTY</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600 w-20">ITEM</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600">DESCRIPTION</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">UNIT</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-14">TARIFF</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">EXT.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedTSIMaterials.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-2 py-1 text-center">{item.quantity}</td>
                        <td className="px-2 py-1 truncate max-w-[80px]" title={item.partNumber}>{item.partNumber}</td>
                        <td className="px-2 py-1 truncate max-w-[150px]" title={item.description}>{item.description}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.tariffAmount)}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Subcontractor Provided Parts */}
            {subcontractorMaterials.length > 0 && (
              <div>
                <div className="bg-[#4a5568] text-white px-3 py-2 text-xs font-semibold flex justify-between">
                  <span>Subcontractor Provided Parts</span>
                  <span>{formatCurrency(subcontractorMaterialsTotal)}</span>
                </div>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600 w-10">QTY</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600 w-20">ITEM</th>
                      <th className="text-left px-2 py-1 font-semibold text-gray-600">DESCRIPTION</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">UNIT</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-14">TARIFF</th>
                      <th className="text-right px-2 py-1 font-semibold text-gray-600 w-16">EXT.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcontractorMaterials.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-2 py-1 text-center">{item.quantity}</td>
                        <td className="px-2 py-1 truncate max-w-[80px]" title={item.partNumber}>{item.partNumber}</td>
                        <td className="px-2 py-1 truncate max-w-[150px]" title={item.description}>{item.description}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.tariffAmount)}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Materials Total */}
            <div className="flex justify-between px-3 py-2 bg-gray-200 font-semibold text-sm text-[#1a365d]">
              <span>Materials Total</span>
              <span>{formatCurrency(materialsTotal)}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="bg-gray-200 px-3 py-2 rounded-t font-semibold text-[#1a365d] text-sm">
              Materials
            </div>
            <div className="border border-gray-200 border-t-0 rounded-b p-3">
              <p className="text-xs italic text-gray-400">No materials added</p>
            </div>
          </div>
        )}

        {/* Labor Summary */}
        <div className="mb-4">
          <div className="bg-gray-200 px-3 py-2 rounded-t font-semibold text-[#1a365d] text-sm flex items-center justify-between">
            <span>Labor Summary</span>
            {laborByCategory.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  const newValue = !consolidateLabor;
                  setConsolidateLabor(newValue);
                  mutation.mutate({ consolidateLabor: newValue });
                }}
                className="flex items-center gap-1.5 text-[10px] font-normal text-gray-600 hover:text-[#1a365d] transition-colors"
              >
                <span className={`w-8 h-4 rounded-full relative transition-colors ${consolidateLabor ? 'bg-[#1a365d]' : 'bg-gray-400'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${consolidateLabor ? 'left-4' : 'left-0.5'}`} />
                </span>
                <span>Consolidate</span>
              </button>
            )}
          </div>
          <div className="border border-gray-200 border-t-0 rounded-b p-3">
            {laborByCategory.size > 0 ? (
              consolidateLabor ? (
                // Consolidated view - show only total
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">Labor (Consolidated)</span>
                  <span className="font-semibold text-[#1a365d]">{formatCurrency(laborTotal)}</span>
                </div>
              ) : (
                // Itemized view - show each category
                <div className="space-y-1 text-xs">
                  {Array.from(laborByCategory.entries()).map(([category, data]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-gray-600">{CATEGORY_LABELS[category] || category}</span>
                      <span className="font-medium">{formatCurrency(data.total)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                    <span className="text-gray-600 font-medium">Labor Total</span>
                    <span className="font-semibold">{formatCurrency(laborTotal)}</span>
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs italic text-gray-400">No labor added</p>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-[#1a365d] mb-3 text-sm">Financial Summary</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Materials Total</span>
              <span className="font-medium">{formatCurrency(materialsTotal)}</span>
            </div>
            {tariffTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tariff Total</span>
                <span className="font-medium">{formatCurrency(tariffTotal)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Labor Total</span>
              <span className="font-medium">{formatCurrency(laborTotal)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(materialsTotal + laborTotal)}</span>
            </div>
            {Number(config.indirectCost) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Indirect Costs</span>
                <span className="font-medium">{formatCurrency(Number(config.indirectCost))}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-[#1a365d]">
              <span className="font-bold text-[#1a365d]">Purchase Price (Excl. Taxes)</span>
              <span className="font-bold text-[#1a365d] text-base">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Signature Block Preview */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-[10px] font-semibold text-[#1a365d] uppercase tracking-wide mb-2">Client Acceptance</h4>
            <div className="space-y-2 text-[9px] text-gray-500">
              <div className="flex items-end gap-2">
                <span className="w-20">Date Accepted:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="w-20">Signature:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="w-20">Printed Name:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-[10px] font-semibold text-[#1a365d] uppercase tracking-wide mb-2">TSI Representative</h4>
            <div className="space-y-2 text-[9px] text-gray-500">
              <div className="flex items-end gap-2">
                <span className="w-20">Date Submitted:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="w-20">Signature:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="w-20">Submitted By:</span>
                <span className="flex-1 border-b border-gray-300"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Actual image */}
      <img
        src="/images/proposal/footer.jpg"
        alt="TSI Footer"
        className="w-full h-auto mt-4"
      />
    </div>
  );
}
