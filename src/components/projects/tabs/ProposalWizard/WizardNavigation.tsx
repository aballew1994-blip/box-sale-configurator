"use client";

import { useWizard } from "./WizardContext";
import { Button } from "@/components/ui";

interface WizardNavigationProps {
  onComplete?: () => void;
}

export function WizardNavigation({ onComplete }: WizardNavigationProps) {
  const {
    isFirstSection,
    isLastSection,
    currentSection,
    completedSections,
    goPrevious,
    goNext,
    skipSection,
  } = useWizard();

  const isCurrentSectionComplete = currentSection ? completedSections.has(currentSection.key) : false;

  const handleNext = () => {
    if (isLastSection && onComplete) {
      onComplete();
    } else {
      goNext();
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
      {/* Previous */}
      <Button
        variant="secondary"
        onClick={goPrevious}
        disabled={isFirstSection}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
      >
        Previous
      </Button>

      {/* Skip */}
      <Button
        variant="ghost"
        onClick={skipSection}
        disabled={isLastSection}
        className="text-muted-foreground hover:text-foreground"
      >
        Skip for now
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </Button>

      {/* Next / Complete */}
      <Button
        variant={isLastSection ? "accent" : "primary"}
        onClick={handleNext}
        rightIcon={
          isLastSection ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )
        }
      >
        {isLastSection ? "Complete & Generate PDF" : "Next Section"}
      </Button>
    </div>
  );
}
