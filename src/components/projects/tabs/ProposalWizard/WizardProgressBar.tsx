"use client";

import { useWizard } from "./WizardContext";

export function WizardProgressBar() {
  const {
    sections,
    currentSectionIndex,
    completedSections,
    skippedSections,
    completedCount,
    completionPercentage,
    goToSection,
  } = useWizard();

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Proposal Progress</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {sections.length} sections complete
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {sections.map((section, index) => {
          const isActive = index === currentSectionIndex;
          const isCompleted = completedSections.has(section.key);
          const isSkipped = skippedSections.has(section.key);

          let bgColor = "bg-secondary";
          let textColor = "text-muted-foreground";
          let borderColor = "border-transparent";

          if (isActive) {
            bgColor = "bg-primary";
            textColor = "text-primary-foreground";
            borderColor = "border-primary";
          } else if (isCompleted) {
            bgColor = "bg-status-success";
            textColor = "text-white";
          } else if (isSkipped) {
            bgColor = "bg-status-warning";
            textColor = "text-white";
          }

          return (
            <button
              key={section.key}
              onClick={() => goToSection(index)}
              className={`flex-1 group relative`}
              title={section.label}
            >
              <div
                className={`h-8 ${bgColor} ${textColor} rounded flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-primary/50 border-2 ${borderColor}`}
              >
                {isCompleted && !isActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isSkipped && !isActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {section.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-status-success" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-status-warning" />
          <span>Skipped</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
