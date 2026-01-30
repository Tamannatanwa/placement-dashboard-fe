"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { StepNavigation } from "./StepNavigation";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { AcademicInfoStep } from "./steps/AcademicInfoStep";
import { AdditionalInfoStep } from "./steps/AdditionalInfoStep";
import { ReviewStep } from "./steps/ReviewStep";
import {
  personalInfoSchema,
  academicInfoSchema,
  additionalInfoSchema,
  completeProfileSchema,
} from "@/lib/validations/profile";
import { ProfileFormData } from "@/types/profile";
import { studentsApi } from "@/lib/api/students";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileWizardProps {
  initialData?: Partial<ProfileFormData>;
  userRole?: "student" | "admin" | "placement";
  onComplete?: (data: ProfileFormData) => void;
}

const STEPS = [
  {
    id: "personal",
    title: "Personal",
    description: "Basic information",
    validationSchema: personalInfoSchema,
  },
  {
    id: "academic",
    title: "Academic",
    description: "Education details",
    validationSchema: academicInfoSchema,
  },
  {
    id: "additional",
    title: "Additional",
    description: "Optional information",
    validationSchema: additionalInfoSchema,
  },
  {
    id: "review",
    title: "Review",
    description: "Final review",
    validationSchema: completeProfileSchema,
  },
];

export function ProfileWizard({
  initialData = {},
  userRole = "student",
  onComplete,
}: ProfileWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing profile data
  useEffect(() => {
    if (userRole === "student") {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  const loadProfile = async () => {
    try {
      const profile = await studentsApi.getMyProfile();
      console.log("Loaded profile:", profile);
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        passing_year: profile.passing_year || new Date().getFullYear(),
        cgpa: profile.cgpa || 0,
        college_id: profile.college_id || 0,
        resume_url: profile.resume_url || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const step = STEPS[currentStep];
    if (!step) return false;

    try {
      // Get relevant data for current step
      let dataToValidate: any = {};
      
      if (currentStep === 0) {
        // Personal info step
        dataToValidate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
        };
      } else if (currentStep === 1) {
        // Academic info step
        dataToValidate = {
          degree: formData.degree,
          branch: formData.branch,
          passing_year: formData.passing_year,
          cgpa: formData.cgpa,
        };
      } else if (currentStep === 2) {
        // Additional info step (optional)
        dataToValidate = {
          resume_url: formData.resume_url || "",
        };
      } else if (currentStep === 3) {
        // Review step - validate complete profile
        dataToValidate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          degree: formData.degree,
          branch: formData.branch,
          passing_year: formData.passing_year,
          cgpa: formData.cgpa,
        };
      }

      await step.validationSchema.parseAsync(dataToValidate);
      return true;
    } catch (error: any) {
      const errors = error.errors || [];
      if (errors.length > 0) {
        errors.forEach((err: any) => {
          toast.error(err.message || "Validation failed");
        });
      } else {
        toast.error(error.message || "Validation failed");
      }
      return false;
    }
  };

  const handleNext = async () => {
    // If on last step, submit directly without validation (validation happens in handleSubmit)
    if (currentStep === STEPS.length - 1) {
      await handleSubmit();
      return;
    }

    // For other steps, validate before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) {
      console.log("Validation failed for step:", currentStep);
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const handleUpdate = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called with formData:", formData);
    setIsSubmitting(true);
    try {
      // Final validation with all required fields
      const dataToValidate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        degree: formData.degree,
        branch: formData.branch,
        passing_year: formData.passing_year,
        cgpa: formData.cgpa,
      };

      console.log("Validating data:", dataToValidate);
      await completeProfileSchema.parseAsync(dataToValidate);
      console.log("Validation passed");

      if (userRole === "student") {
        // Update student profile via API (includes all fields)
        const updateData = {
          first_name: formData.first_name!,
          last_name: formData.last_name!,
          phone: formData.phone!,
          degree: formData.degree!,
          branch: formData.branch!,
          passing_year: formData.passing_year!,
          cgpa: formData.cgpa!,
          college_id: formData.college_id,
          resume_url: formData.resume_url,
        };

        const updatedProfile = await studentsApi.updateMyProfile(updateData);
        console.log("Profile updated successfully:", updatedProfile);
        toast.success("Profile updated successfully!");
      }

      // Call completion callback if provided
      if (onComplete) {
        onComplete(formData as ProfileFormData);
      }

      // Redirect or show success
      setTimeout(() => {
        const role = userRole || "student";
        if (role === "student") {
          router.push("/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/placement/dashboard");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting profile:", error);
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          const field = err.path?.join(".") || "field";
          toast.error(`${field}: ${err.message || "Validation failed"}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile. Please check all fields are filled correctly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const canGoNext = currentStep < STEPS.length - 1 || currentStep === STEPS.length - 1;
  const canGoPrevious = currentStep > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Progress Bar */}
        <Card className="mb-6 border-cyan-500/20 bg-cyan-500/5">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Complete Your Profile</h2>
              <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Step Indicator */}
        <Card className="mb-6">
          <div className="p-6">
            <StepIndicator
              steps={STEPS.map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
              }))}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>
        </Card>

        {/* Step Content */}
        <div className="mb-6">
          {currentStep === 0 && (
            <PersonalInfoStep
              formData={formData}
              onUpdate={handleUpdate}
            />
          )}
          {currentStep === 1 && (
            <AcademicInfoStep
              formData={formData}
              onUpdate={handleUpdate}
            />
          )}
          {currentStep === 2 && (
            <AdditionalInfoStep
              formData={formData}
              onUpdate={handleUpdate}
            />
          )}
          {currentStep === 3 && (
            <ReviewStep
              formData={formData}
              onUpdate={handleUpdate}
              onEditStep={handleStepClick}
            />
          )}
        </div>

        {/* Navigation */}
        <Card>
          <div className="p-6">
            <StepNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              isSubmitting={isSubmitting}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

