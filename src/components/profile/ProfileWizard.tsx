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
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  // Refs for step validation
  const personalInfoRef = useRef<PersonalInfoStepHandle>(null);
  const academicInfoRef = useRef<AcademicInfoStepHandle>(null);
  const additionalInfoRef = useRef<AdditionalInfoStepHandle>(null);

  // Load existing profile data only when component mounts (when user clicks profile tab)
  useEffect(() => {
    // Only load profile if user is student and profile hasn't been loaded yet
    if (userRole === "student" && !profileLoaded && !isLoading) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]); // Only depend on userRole, loadProfile will handle its own state

  const loadProfile = async () => {
    // Prevent multiple simultaneous loads
    if (isLoading || profileLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      const profile = await studentsApi.getMyProfile();
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        current_address: profile.current_address || "",
        highest_qualification: profile.highest_qualification 
          ? (() => {
              const qual = profile.highest_qualification.toLowerCase();
              // Map backend lowercase values to frontend capitalized format
              const qualMap: { [key: string]: string } = {
                '10th': '10th',
                '12th': '12th',
                'diploma': 'Diploma',
                'graduation': 'Graduation',
                'post-graduation': 'Post-Graduation',
                'phd': 'PhD'
              };
              return qualMap[qual] || qual.charAt(0).toUpperCase() + qual.slice(1);
            })()
          : "",
        college_name: profile.college_name || "",
        college_id: profile.college_id || 0,
        course: profile.course || "",
        branch: profile.branch || "",
        passing_year: profile.passing_year || new Date().getFullYear(),
        percentage: profile.percentage,
        cgpa: profile.cgpa,
        technical_skills: profile.technical_skills || [],
        soft_skills: profile.soft_skills || [],
        experience_type: profile.experience_type || undefined,
        internship_details: profile.internship_details || [],
        projects: profile.projects || [],
        languages: profile.languages || [],
        // Handle nested preference object or flat fields (backward compatibility)
        // Ensure arrays are always arrays (not null/undefined)
        job_type: Array.isArray(profile.preference?.job_type) 
          ? profile.preference.job_type 
          : Array.isArray(profile.job_type) 
            ? profile.job_type 
            : [],
        work_mode: Array.isArray(profile.preference?.work_mode) 
          ? profile.preference.work_mode 
          : Array.isArray(profile.work_mode) 
            ? profile.work_mode 
            : [],
        preferred_job_role: Array.isArray(profile.preference?.preferred_job_role) 
          ? profile.preference.preferred_job_role 
          : Array.isArray(profile.preferred_job_role) 
            ? profile.preferred_job_role 
            : [],
        preferred_location: Array.isArray(profile.preference?.preferred_location) 
          ? profile.preference.preferred_location 
          : Array.isArray(profile.preferred_location) 
            ? profile.preferred_location 
            : [],
        expected_salary: profile.preference?.expected_salary ?? profile.expected_salary,
        github_profile: profile.github_profile || "",
        linkedin_profile: profile.linkedin_profile || "",
        portfolio_url: profile.portfolio_url || "",
        coding_platforms: profile.coding_platforms || {},
        resume_url: profile.resume_url || "",
      });
      
      // Debug: Log preference data to verify it's loaded correctly
      console.log("Profile loaded - Preferences:", {
        preference: profile.preference,
        job_type: Array.isArray(profile.preference?.job_type) ? profile.preference.job_type : Array.isArray(profile.job_type) ? profile.job_type : [],
        work_mode: Array.isArray(profile.preference?.work_mode) ? profile.preference.work_mode : Array.isArray(profile.work_mode) ? profile.work_mode : [],
        preferred_job_role: Array.isArray(profile.preference?.preferred_job_role) ? profile.preference.preferred_job_role : Array.isArray(profile.preferred_job_role) ? profile.preferred_job_role : [],
        preferred_location: Array.isArray(profile.preference?.preferred_location) ? profile.preference.preferred_location : Array.isArray(profile.preferred_location) ? profile.preferred_location : [],
      });
      
      setProfileLoaded(true);
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      // Don't show error toast if profile doesn't exist (404) - user can create new profile
      if (error.response?.status !== 404) {
        toast.error("Failed to load profile data");
      }
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
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        current_address: formData.current_address || undefined,
        highest_qualification: formData.highest_qualification || undefined,
        college_name: formData.college_name || undefined,
        course: formData.course || undefined,
        branch: formData.branch || undefined,
        passing_year: formData.passing_year || undefined,
        percentage: formData.percentage || undefined,
        cgpa: formData.cgpa || undefined,
        technical_skills: formData.technical_skills || undefined,
        soft_skills: formData.soft_skills || undefined,
        experience_type: formData.experience_type || undefined,
        internship_details: formData.internship_details || undefined,
        projects: formData.projects || undefined,
        languages: formData.languages || undefined,
        job_type: formData.job_type || undefined,
        work_mode: formData.work_mode || undefined,
        preferred_job_role: formData.preferred_job_role || undefined,
        preferred_location: formData.preferred_location || undefined,
        expected_salary: formData.expected_salary || undefined,
        github_profile: formData.github_profile || undefined,
        linkedin_profile: formData.linkedin_profile || undefined,
        portfolio_url: formData.portfolio_url || undefined,
        coding_platforms: formData.coding_platforms || undefined,
        resume_url: formData.resume_url || undefined,
      };

      // Validate format (not required fields)
      await completeProfileSchema.parseAsync(dataToValidate);

      if (userRole === "student") {
        // Update student profile via API - Build update data from formData
        const updateData: any = {};
        
        // Personal Details - Only include if field exists in formData
        if ('first_name' in formData) updateData.first_name = formData.first_name || null;
        if ('last_name' in formData) updateData.last_name = formData.last_name || null;
        if ('phone' in formData) updateData.phone = formData.phone || null;
        if ('date_of_birth' in formData) updateData.date_of_birth = formData.date_of_birth || null;
        if ('gender' in formData) updateData.gender = formData.gender || null;
        if ('current_address' in formData) updateData.current_address = formData.current_address || null;
        
        // Education Details
        if ('highest_qualification' in formData) updateData.highest_qualification = formData.highest_qualification && formData.highest_qualification.trim() ? formData.highest_qualification.trim() : null;
        if ('college_name' in formData) updateData.college_name = formData.college_name || null;
        if ('college_id' in formData) updateData.college_id = formData.college_id || null;
        if ('course' in formData) updateData.course = formData.course || null;
        if ('branch' in formData) updateData.branch = formData.branch || null;
        if ('passing_year' in formData) updateData.passing_year = formData.passing_year || null;
        if ('percentage' in formData) updateData.percentage = formData.percentage ?? null;
        if ('cgpa' in formData) updateData.cgpa = formData.cgpa ?? null;
        
        // Skills - Include empty arrays if field exists
        if ('technical_skills' in formData) updateData.technical_skills = formData.technical_skills || [];
        if ('soft_skills' in formData) updateData.soft_skills = formData.soft_skills || [];
        
        // Experience
        if ('experience_type' in formData) updateData.experience_type = formData.experience_type || null;
        if ('internship_details' in formData) updateData.internship_details = formData.internship_details || [];
        if ('projects' in formData) updateData.projects = formData.projects || [];
        
        // Languages
        if ('languages' in formData) updateData.languages = formData.languages || [];
        
        // Job Preferences
        if ('job_type' in formData) updateData.job_type = formData.job_type || [];
        if ('work_mode' in formData) updateData.work_mode = formData.work_mode || [];
        if ('preferred_job_role' in formData) updateData.preferred_job_role = formData.preferred_job_role || [];
        if ('preferred_location' in formData) updateData.preferred_location = formData.preferred_location || [];
        if ('expected_salary' in formData) updateData.expected_salary = formData.expected_salary ?? null;
        
        // Technical Profile Links
        if ('github_profile' in formData) updateData.github_profile = formData.github_profile || null;
        if ('linkedin_profile' in formData) updateData.linkedin_profile = formData.linkedin_profile || null;
        if ('portfolio_url' in formData) updateData.portfolio_url = formData.portfolio_url || null;
        if ('coding_platforms' in formData) updateData.coding_platforms = formData.coding_platforms || {};

        try {
          await studentsApi.updateMyProfile(updateData);
          toast.success("Profile saved successfully! You can complete it later.");
          
          // Call completion callback if provided
          if (onComplete) {
            onComplete(formData as ProfileFormData);
          }

          // Redirect only on success
          setTimeout(() => {
            const role = userRole || "student";
            if (role === "student") {
              router.push("/student/dashboard");
            } else if (role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/placement/dashboard");
            }
          }, 1500);
        } catch (apiError: any) {
          // Don't redirect on API failure - re-throw to be caught by outer catch
          console.error("API Error:", apiError);
          throw apiError;
        }
      } else {
        // For non-student roles, just call callback
        if (onComplete) {
          onComplete(formData as ProfileFormData);
        }
      }
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-300">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-300 hover:text-white hover:bg-[#282142] transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Progress Bar */}
        <Card className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white">Complete Your Profile</h2>
              <span className="text-sm font-medium text-blue-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Step Indicator */}
        <Card className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8">
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
        <div>
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
        <Card className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8">
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
  );
}

