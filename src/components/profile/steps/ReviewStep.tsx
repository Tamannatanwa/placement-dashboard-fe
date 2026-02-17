"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepContentProps } from "@/types/profile";
import { CheckCircle2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewStepProps extends StepContentProps {
  onEditStep?: (step: number) => void;
}

export function ReviewStep({ formData, onEditStep }: ReviewStepProps) {
  // Format array fields for display
  const jobTypeDisplay = formData.job_type && formData.job_type.length > 0 
    ? formData.job_type.join(", ") 
    : undefined;
  const workModeDisplay = formData.work_mode && formData.work_mode.length > 0 
    ? formData.work_mode.join(", ") 
    : undefined;
  const preferredJobRoleDisplay = formData.preferred_job_role && formData.preferred_job_role.length > 0 
    ? formData.preferred_job_role.join(", ") 
    : undefined;
  const preferredLocationDisplay = formData.preferred_location && formData.preferred_location.length > 0 
    ? formData.preferred_location.join(", ") 
    : undefined;

  const reviewSections = [
    {
      title: "Personal Information",
      stepIndex: 0,
      fields: [
        { label: "First Name", value: formData.first_name },
        { label: "Last Name", value: formData.last_name },
        { label: "Phone", value: formData.phone },
        { label: "Email", value: formData.email },
        { label: "Date of Birth", value: formData.date_of_birth },
        { label: "Gender", value: formData.gender },
        { label: "Current Address", value: formData.current_address },
      ],
    },
    {
      title: "Academic Information",
      stepIndex: 1,
      fields: [
        { label: "Highest Qualification", value: formData.highest_qualification && formData.highest_qualification.trim() ? formData.highest_qualification.trim() : undefined },
        { label: "College / University Name", value: formData.college_name },
        { label: "Course", value: formData.course },
        { label: "Branch", value: formData.branch },
        { label: "Passing Year", value: formData.passing_year?.toString() },
        { label: "Percentage", value: formData.percentage?.toString() },
        { label: "CGPA", value: formData.cgpa?.toString() },
      ],
    },
    {
      title: "Additional Information",
      stepIndex: 2,
      fields: [
        {
          label: "Technical Skills",
          value:
            formData.technical_skills && formData.technical_skills.length > 0
              ? formData.technical_skills.join(", ")
              : undefined,
        },
        {
          label: "Soft Skills",
          value:
            formData.soft_skills && formData.soft_skills.length > 0
              ? formData.soft_skills.join(", ")
              : undefined,
        },
        { label: "Experience Type", value: formData.experience_type },
        {
          label: "Internship Details",
          value:
            formData.internship_details && formData.internship_details.length > 0
              ? formData.internship_details
                  .map((internship) => {
                    const parts = [];
                    if (internship.company_name) parts.push(internship.company_name);
                    if (internship.duration) parts.push(internship.duration);
                    if (internship.role) parts.push(internship.role);
                    return parts.join(" - ");
                  })
                  .join(" | ")
              : undefined,
        },
        {
          label: "Projects",
          value:
            formData.projects && formData.projects.length > 0
              ? formData.projects
                  .map((project) => {
                    const parts = [];
                    if (project.title) parts.push(project.title);
                    if (project.description) parts.push(project.description);
                    return parts.join(" - ");
                  })
                  .join(" | ")
              : undefined,
        },
        { label: "Job Type", value: jobTypeDisplay },
        { label: "Work Mode", value: workModeDisplay },
        { label: "Preferred Job Role", value: preferredJobRoleDisplay },
        { label: "Preferred Location", value: preferredLocationDisplay },
        {
          label: "Expected Salary",
          value: formData.expected_salary
            ? `₹${formData.expected_salary.toLocaleString()}`
            : undefined,
        },
        { label: "GitHub Profile", value: formData.github_profile },
        { label: "LinkedIn Profile", value: formData.linkedin_profile },
        { label: "Portfolio / Personal Website", value: formData.portfolio_url },
        { label: "Resume URL", value: formData.resume_url },
      ],
    },
  ];

  return (
    <Card className="border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Review Your Information</CardTitle>
            <CardDescription>
              Please review all your details before submitting
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviewSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {onEditStep && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStep(section.stepIndex)}
                    className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {field.label}
                    </p>
                    <p className="text-sm font-semibold">
                      {field.value || (
                        <span className="text-muted-foreground italic">Not provided</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
              <CheckCircle2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                  Ready to Submit
                </p>
                <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                  By clicking submit, you confirm that all the information provided is accurate
                  and complete. You can update your profile later if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

