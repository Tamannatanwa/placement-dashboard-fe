"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { StepNavigation } from "./StepNavigation";
import { PersonalInfoStep, PersonalInfoStepHandle } from "./steps/PersonalInfoStep";
import { AcademicInfoStep, AcademicInfoStepHandle } from "./steps/AcademicInfoStep";
import { AdditionalInfoStep, AdditionalInfoStepHandle } from "./steps/AdditionalInfoStep";
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
  
  // Refs for step validation
  const personalInfoRef = useRef<PersonalInfoStepHandle>(null);
  const academicInfoRef = useRef<AcademicInfoStepHandle>(null);
  const additionalInfoRef = useRef<AdditionalInfoStepHandle>(null);

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
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        course: (profile as any).course || "",
        current_module: (profile as any).current_module || "",
        career_goal: (profile as any).career_goal || "",
        degree: profile.degree || "",
        branch: profile.branch || "",
        passing_year: profile.passing_year || new Date().getFullYear(),
        cgpa: profile.cgpa || 0,
        college_id: profile.college_id || 0,
        educational_qualification: (profile as any).educational_qualification || "",
        institute_name: (profile as any).institute_name || "",
        status: (profile as any).status,
        resume_url: profile.resume_url || "",
        portfolio_url: (profile as any).portfolio_url || "",
        skills: (profile as any).skills || "",
        preferred_work_mode: (profile as any).preferred_work_mode || "",
        looking_for: (profile as any).looking_for || "",
      });
    } catch (error: any) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    // Allow navigation without strict validation - just save current data
    // Validate only if fields are filled (for format validation)
    if (currentStep === 0 && personalInfoRef.current) {
      // Try to validate, but don't block if validation fails
      const isValid = await personalInfoRef.current.validate();
      // Always allow navigation, just save what's there
      return true;
    } else if (currentStep === 1 && academicInfoRef.current) {
      const isValid = await academicInfoRef.current.validate();
      return true;
    } else if (currentStep === 2 && additionalInfoRef.current) {
      const isValid = await additionalInfoRef.current.validate();
      return true;
    } else if (currentStep === 3) {
      // Review step - allow submission with partial data
      // Only validate format if fields are filled
      try {
        const dataToValidate = {
          first_name: formData.first_name || undefined,
          last_name: formData.last_name || undefined,
          phone: formData.phone || undefined,
          course: formData.course || undefined,
          current_module: formData.current_module || undefined,
          career_goal: formData.career_goal || undefined,
          degree: formData.degree || undefined,
          branch: formData.branch || undefined,
          passing_year: formData.passing_year || undefined,
          cgpa: formData.cgpa || undefined,
          educational_qualification: formData.educational_qualification || undefined,
          institute_name: formData.institute_name || undefined,
          status: formData.status || undefined,
          resume_url: formData.resume_url || undefined,
          portfolio_url: formData.portfolio_url || undefined,
          skills: formData.skills || undefined,
          preferred_work_mode: formData.preferred_work_mode || undefined,
          looking_for: formData.looking_for || undefined,
        };
        await completeProfileSchema.parseAsync(dataToValidate);
        return true;
      } catch (error: any) {
        // Only show errors for fields that have values (format validation)
        const errors = error.errors || [];
        const formatErrors = errors.filter((err: any) => {
          const field = err.path?.[0];
          return formData[field as keyof typeof formData];
        });
        if (formatErrors.length > 0) {
          const errorMessages = formatErrors.map((err: any) => {
            const field = err.path?.join(".") || "field";
            return `${field}: ${err.message || "Invalid format"}`;
          });
          toast.error(`Please fix format errors:\n${errorMessages.join("\n")}`);
          return false;
        }
        // No format errors, allow submission
        return true;
      }
    }
    return true;
  };

  const handleNext = async () => {
    // If on last step, submit directly (validation happens in handleSubmit)
    if (currentStep === STEPS.length - 1) {
      await handleSubmit();
      return;
    }

    // For other steps, validate before proceeding
    const isValid = await validateCurrentStep();
    if (!isValid) {
      // Validation errors are now shown inline via FormMessage components
      // Scroll to first error field if needed
      const firstError = document.querySelector('[data-slot="form-message"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
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
    setIsSubmitting(true);
    try {
      // Validate format only for fields that have values
      const dataToValidate = {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone: formData.phone || undefined,
        course: formData.course || undefined,
        current_module: formData.current_module || undefined,
        career_goal: formData.career_goal || undefined,
        degree: formData.degree || undefined,
        branch: formData.branch || undefined,
        passing_year: formData.passing_year || undefined,
        cgpa: formData.cgpa || undefined,
        educational_qualification: formData.educational_qualification || undefined,
        institute_name: formData.institute_name || undefined,
        status: formData.status || undefined,
        resume_url: formData.resume_url || undefined,
        portfolio_url: formData.portfolio_url || undefined,
        skills: formData.skills || undefined,
        preferred_work_mode: formData.preferred_work_mode || undefined,
        looking_for: formData.looking_for || undefined,
      };

      // Validate format (not required fields)
      await completeProfileSchema.parseAsync(dataToValidate);

      if (userRole === "student") {
        // Update student profile via API with whatever data is available
        const updateData: any = {};
        
        if (formData.first_name) updateData.first_name = formData.first_name;
        if (formData.last_name) updateData.last_name = formData.last_name;
        if (formData.phone) updateData.phone = formData.phone;
        if (formData.course) updateData.course = formData.course;
        if (formData.current_module) updateData.current_module = formData.current_module;
        if (formData.career_goal) updateData.career_goal = formData.career_goal;
        if (formData.degree) updateData.degree = formData.degree;
        if (formData.branch) updateData.branch = formData.branch;
        if (formData.passing_year) updateData.passing_year = formData.passing_year;
        if (formData.cgpa !== undefined) updateData.cgpa = formData.cgpa;
        if (formData.college_id) updateData.college_id = formData.college_id;
        if (formData.educational_qualification) updateData.educational_qualification = formData.educational_qualification;
        if (formData.institute_name) updateData.institute_name = formData.institute_name;
        if (formData.status) updateData.status = formData.status;
        if (formData.resume_url) updateData.resume_url = formData.resume_url;
        if (formData.portfolio_url) updateData.portfolio_url = formData.portfolio_url;
        if (formData.skills) updateData.skills = formData.skills;
        if (formData.preferred_work_mode) updateData.preferred_work_mode = formData.preferred_work_mode;
        if (formData.looking_for) updateData.looking_for = formData.looking_for;

        await studentsApi.updateMyProfile(updateData);
        toast.success("Profile saved successfully! You can complete it later.");
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
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map((err: any) => {
          const field = err.path?.join(".") || "field";
          return `${field}: ${err.message || "Validation failed"}`;
        });
        toast.error(`Please fix the following errors:\n${errorMessages.join("\n")}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save profile. Please check the format of filled fields.");
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
              ref={personalInfoRef}
              formData={formData}
              onUpdate={handleUpdate}
            />
          )}
          {currentStep === 1 && (
            <AcademicInfoStep
              ref={academicInfoRef}
              formData={formData}
              onUpdate={handleUpdate}
            />
          )}
          {currentStep === 2 && (
            <AdditionalInfoStep
              ref={additionalInfoRef}
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

