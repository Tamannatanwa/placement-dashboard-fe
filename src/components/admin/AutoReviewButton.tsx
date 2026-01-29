"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { performAutomatedReview } from "@/lib/utils/resumeReview";
import { Student } from "@/types/student";
import { toast } from "sonner";

interface AutoReviewButtonProps {
  student: Student;
  onReviewComplete: (review: {
    resumeScore: number;
    resumeStructure: string;
    resumeProjects: string;
    projectScore: number;
    projectDifficulty: "easy" | "medium" | "hard";
    projectReview: string;
  }) => void;
}

/**
 * Button to trigger automated resume and project review
 */
export function AutoReviewButton({ student, onReviewComplete }: AutoReviewButtonProps) {
  const [isReviewing, setIsReviewing] = useState(false);

  const handleAutoReview = async () => {
    setIsReviewing(true);
    
    try {
      // Perform automated review
      const review = performAutomatedReview(
        student.resume || "",
        student.resume || "",
        student.projects || ""
      );

      // Callback with review results
      onReviewComplete({
        resumeScore: review.structureScore,
        resumeStructure: review.structure,
        resumeProjects: review.projects,
        projectScore: review.projectsScore,
        projectDifficulty: review.difficulty,
        projectReview: review.projects,
      });

      toast.success("Automated review completed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to perform automated review");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <Button
      onClick={handleAutoReview}
      disabled={isReviewing || (!student.resume && !student.projects)}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {isReviewing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Reviewing...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Run Automated Review
        </>
      )}
    </Button>
  );
}




