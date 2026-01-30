"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNavigationProps } from "@/types/profile";

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isSubmitting = false,
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  const handleClick = () => {
    if (!isSubmitting) {
      onNext();
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        className="min-w-[120px]"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="text-sm text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </div>

      <Button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="min-w-[120px] bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white disabled:opacity-50"
      >
        {isLastStep ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

