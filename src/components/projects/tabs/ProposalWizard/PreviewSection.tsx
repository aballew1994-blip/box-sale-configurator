"use client";

import { forwardRef } from "react";
import type { ProposalSection } from "./types";

interface PreviewSectionProps {
  section: ProposalSection;
  content: string;
  isActive: boolean;
  isSkipped: boolean;
  onClick: () => void;
}

export const PreviewSection = forwardRef<HTMLDivElement, PreviewSectionProps>(
  function PreviewSection({ section, content, isActive, isSkipped, onClick }, ref) {
    const hasContent = content && content.trim().length > 0;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`
          cursor-pointer rounded-lg transition-all duration-200
          ${isActive ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : "hover:bg-gray-50"}
          ${isSkipped && !hasContent ? "opacity-60" : ""}
        `}
      >
        {/* Section Title - matches PDF styling */}
        <div className="px-3 pt-3 pb-2">
          <h3 className="text-sm font-bold text-[#1a365d] border-b-[2px] border-[#1a365d] pb-1">
            {section.label}
          </h3>
        </div>

        {/* Section Content */}
        <div className="px-3 pb-3">
          {hasContent ? (
            <div className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <div className="text-xs italic text-gray-400 bg-gray-50 p-3 rounded border border-dashed border-gray-200">
              <div className="flex items-center gap-2">
                {isSkipped ? (
                  <>
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Skipped - Click to add content</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Click to add {section.label.toLowerCase()}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
