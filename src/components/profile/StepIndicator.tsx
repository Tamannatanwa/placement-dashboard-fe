"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepIndicatorProps {
  steps: Array<{ id: string; title: string; description: string }>;
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted
                      ? "bg-cyan-600 border-cyan-600 text-white"
                      : isCurrent
                      ? "bg-cyan-50 dark:bg-cyan-950 border-cyan-600 text-cyan-600 dark:text-cyan-400"
                      : "bg-background border-muted-foreground/30 text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent
                        ? "text-cyan-600 dark:text-cyan-400"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    completedSteps.includes(index) || currentStep > index
                      ? "bg-cyan-600"
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


