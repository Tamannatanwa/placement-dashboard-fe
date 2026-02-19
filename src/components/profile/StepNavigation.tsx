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
    <div className="flex items-center justify-between pt-6 border-t border-gray-600">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious || isSubmitting}
        className="min-w-[120px] backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white hover:bg-[#282142] transition-colors duration-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="text-sm text-gray-300">
        Step {currentStep + 1} of {totalSteps}
      </div>

      <Button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-colors duration-300"
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

