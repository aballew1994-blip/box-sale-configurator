"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProjectConfiguration } from "@/lib/api-client";
import type { ProjectConfiguration } from "@/lib/api-client";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { YesNoWithDetails } from "@/components/shared/YesNoWithDetails";

interface ProjectDetailsTabProps {
  config: ProjectConfiguration;
  onConfigUpdate: (config: ProjectConfiguration) => void;
}

export function ProjectDetailsTab({ config, onConfigUpdate }: ProjectDetailsTabProps) {
  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      updateProjectConfiguration(config.id, data),
    onSuccess: (data) => onConfigUpdate(data.configuration),
  });

  const saveField = useCallback(
    (field: string, value: unknown) => {
      mutation.mutate({ [field]: value });
    },
    [mutation]
  );

  const inputClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none";

  const selectClass =
    "w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors outline-none appearance-none";

  return (
    <div className="space-y-6">
      {/* Section 1: Customer Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Customer Information</h3>
            <p className="text-sm text-muted-foreground">Customer type and billing details</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Customer Type
              </label>
              <select
                className={selectClass}
                value={config.customerType || ""}
                onChange={(e) => saveField("customerType", e.target.value || null)}
              >
                <option value="">Select customer type...</option>
                <option value="END_USER_EXISTING">End User (Existing)</option>
                <option value="END_USER_NEW">End User (New)</option>
                <option value="GC_EXISTING">General Contractor (Existing)</option>
                <option value="GC_NEW">General Contractor (New)</option>
              </select>
            </div>

            {/* Conditional: Acknowledge New Client Form */}
            {(config.customerType === "END_USER_NEW" || config.customerType === "GC_NEW") && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">
                  Acknowledge New Client Form Needed
                </label>
                <ToggleSwitch
                  checked={config.acknowledgeNewClientForm}
                  onChange={(v) => saveField("acknowledgeNewClientForm", v)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border/30">
            <div>
              <div className="text-sm font-medium text-foreground">OUS (Outside US)</div>
              <div className="text-xs text-muted-foreground">Project is outside the United States</div>
            </div>
            <ToggleSwitch
              checked={config.isOUS}
              onChange={(v) => saveField("isOUS", v)}
            />
          </div>

          {/* Conditional: Local Costs (VAT) */}
          {config.isOUS && (
            <div className="flex items-center justify-between py-2 pl-4 border-l-2 border-primary/30">
              <div>
                <div className="text-sm font-medium text-foreground">Local Costs (VAT)</div>
                <div className="text-xs text-muted-foreground">Include VAT in pricing</div>
              </div>
              <ToggleSwitch
                checked={config.hasLocalCostsVAT}
                onChange={(v) => saveField("hasLocalCostsVAT", v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Resource Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Resource Information</h3>
            <p className="text-sm text-muted-foreground">Subcontractors, labor requirements, and services</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5 divide-y divide-border/30">
          {/* Sub Required */}
          <div className="py-3 first:pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Sub Required</div>
                <div className="text-xs text-muted-foreground">Subcontractor needed for this project</div>
              </div>
              <ToggleSwitch
                checked={config.subRequired}
                onChange={(v) => saveField("subRequired", v)}
              />
            </div>
            {config.subRequired && (
              <div className="mt-3 pl-4 border-l-2 border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">Sub Quote</div>
                  <ToggleSwitch
                    checked={config.subQuote}
                    onChange={(v) => saveField("subQuote", v)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Special Working Hours */}
          <YesNoWithDetails
            label="Special Working Hours"
            description="Non-standard working hours required"
            checked={config.specialWorkingHours}
            details={config.specialWorkingHoursDetails}
            onCheckedChange={(v) => saveField("specialWorkingHours", v)}
            onDetailsChange={(v) => saveField("specialWorkingHoursDetails", v)}
            detailsPlaceholder="Describe the special working hours..."
          />

          {/* Union Labor */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-foreground">Union Labor</div>
            </div>
            <ToggleSwitch
              checked={config.unionLabor}
              onChange={(v) => saveField("unionLabor", v)}
            />
          </div>

          {/* Prevailing Wage */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-foreground">Prevailing Wage</div>
            </div>
            <ToggleSwitch
              checked={config.prevailingWage}
              onChange={(v) => saveField("prevailingWage", v)}
            />
          </div>

          {/* Additional Screening */}
          <YesNoWithDetails
            label="Additional Screening"
            description="Extra screening requirements"
            checked={config.additionalScreening}
            details={config.additionalScreeningDetails}
            onCheckedChange={(v) => saveField("additionalScreening", v)}
            onDetailsChange={(v) => saveField("additionalScreeningDetails", v)}
            detailsPlaceholder="Describe the screening requirements..."
          />

          {/* Pro Services or Solutions Architect */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Pro Services or Solutions Architect</div>
              </div>
              <ToggleSwitch
                checked={config.proServicesOrSA}
                onChange={(v) => saveField("proServicesOrSA", v)}
              />
            </div>
            {config.proServicesOrSA && (
              <div className="mt-3 pl-4 border-l-2 border-primary/30 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Remote or Onsite
                  </label>
                  <select
                    className={selectClass}
                    value={config.proServicesLocation || ""}
                    onChange={(e) => saveField("proServicesLocation", e.target.value || null)}
                  >
                    <option value="">Select...</option>
                    <option value="REMOTE">Remote</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                {config.proServicesLocation === "REMOTE" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Remote Access Method
                    </label>
                    <select
                      className={selectClass}
                      value={config.remoteAccessMethod || ""}
                      onChange={(e) => saveField("remoteAccessMethod", e.target.value || null)}
                    >
                      <option value="">Select access method...</option>
                      <option value="CLIENT_PROVIDED_LAPTOP">Client Provided Laptop</option>
                      <option value="CLIENT_PROVIDED_VPN">Client Provided VPN</option>
                      <option value="SCREENSHARE_ANYDESK">Screenshare (Anydesk)</option>
                      <option value="SCREENSHARE_MS_TEAMS">Screenshare (MS Teams)</option>
                      <option value="SCREENSHARE_TEAMVIEWER">Screenshare (TeamViewer)</option>
                      <option value="SCREENSHARE_WEBEX">Screenshare (Webex)</option>
                      <option value="SCREENSHARE_ZOOM">Screenshare (Zoom)</option>
                      <option value="SECURELINK_CUSTOMER">SecureLink - Customer User Account</option>
                      <option value="SECURELINK_TSI">SecureLink - TSI User Account</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Training */}
          <div className="py-3 last:pb-0">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Training
            </label>
            <select
              className={selectClass}
              value={config.trainingType || ""}
              onChange={(e) => saveField("trainingType", e.target.value || null)}
            >
              <option value="">Select training type...</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="PROFESSIONAL_SERVICES">Professional Services</option>
              <option value="SOLUTIONS_ARCHITECT">Solutions Architect</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Installation Details */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Installation Details</h3>
            <p className="text-sm text-muted-foreground">Equipment and requirements for installation</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5 divide-y divide-border/30">
          <YesNoWithDetails
            label="LIFT/Platform Ladder"
            checked={config.liftPlatformLadder}
            details={config.liftPlatformLadderDetails}
            onCheckedChange={(v) => saveField("liftPlatformLadder", v)}
            onDetailsChange={(v) => saveField("liftPlatformLadderDetails", v)}
          />
          <YesNoWithDetails
            label="DUST Containment"
            checked={config.dustContainment}
            details={config.dustContainmentDetails}
            onCheckedChange={(v) => saveField("dustContainment", v)}
            onDetailsChange={(v) => saveField("dustContainmentDetails", v)}
          />
          <YesNoWithDetails
            label="Conduit"
            checked={config.conduit}
            details={config.conduitDetails}
            onCheckedChange={(v) => saveField("conduit", v)}
            onDetailsChange={(v) => saveField("conduitDetails", v)}
          />
          <YesNoWithDetails
            label="Fire Caulk"
            checked={config.fireCaulk}
            details={config.fireCaulkDetails}
            onCheckedChange={(v) => saveField("fireCaulk", v)}
            onDetailsChange={(v) => saveField("fireCaulkDetails", v)}
          />
          <YesNoWithDetails
            label="Fire Alarm Relay"
            checked={config.fireAlarmRelay}
            details={config.fireAlarmRelayDetails}
            onCheckedChange={(v) => saveField("fireAlarmRelay", v)}
            onDetailsChange={(v) => saveField("fireAlarmRelayDetails", v)}
          />
          <YesNoWithDetails
            label="Permits"
            checked={config.permits}
            details={config.permitsDetails}
            onCheckedChange={(v) => saveField("permits", v)}
            onDetailsChange={(v) => saveField("permitsDetails", v)}
          />
          <YesNoWithDetails
            label="SiteOwl Drawing"
            checked={config.siteOwlDrawing}
            details={config.siteOwlDrawingDetails}
            onCheckedChange={(v) => saveField("siteOwlDrawing", v)}
            onDetailsChange={(v) => saveField("siteOwlDrawingDetails", v)}
          />
          <YesNoWithDetails
            label="Cert. of Insurance"
            checked={config.certOfInsurance}
            details={config.certOfInsuranceDetails}
            onCheckedChange={(v) => saveField("certOfInsurance", v)}
            onDetailsChange={(v) => saveField("certOfInsuranceDetails", v)}
          />
          <YesNoWithDetails
            label="Badging Required"
            checked={config.badgingRequired}
            details={config.badgingRequiredDetails}
            onCheckedChange={(v) => saveField("badgingRequired", v)}
            onDetailsChange={(v) => saveField("badgingRequiredDetails", v)}
          />

          {/* Special Instructions */}
          <div className="py-3 last:pb-0">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Special Instructions
            </label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              placeholder="Enter any special instructions..."
              defaultValue={config.specialInstructions || ""}
              onBlur={(e) => saveField("specialInstructions", e.target.value || null)}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Post Installation */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Post Installation</h3>
            <p className="text-sm text-muted-foreground">FOCUS and warranty options</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border/50 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Post Install Plan
            </label>
            <select
              className={selectClass}
              value={config.postInstallPlan || ""}
              onChange={(e) => saveField("postInstallPlan", e.target.value || null)}
            >
              <option value="">Select plan...</option>
              <option value="FOCUS">FOCUS</option>
              <option value="WARRANTY">Warranty</option>
              <option value="TIME_AND_MATERIALS">Time and Materials</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>

          {/* FOCUS Details */}
          {config.postInstallPlan === "FOCUS" && (
            <div className="pl-4 border-l-2 border-primary/30 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  FOCUS Amount
                </label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="0.00"
                  defaultValue={config.focusAmount ? Number(config.focusAmount) : ""}
                  onBlur={(e) =>
                    saveField("focusAmount", e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Include FOCUS Value in Project
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Add FOCUS amount to project total
                  </div>
                </div>
                <ToggleSwitch
                  checked={config.includeFocusInProject}
                  onChange={(v) => saveField("includeFocusInProject", v)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
