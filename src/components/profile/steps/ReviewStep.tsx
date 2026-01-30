"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepContentProps } from "@/types/profile";
import { CheckCircle2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewStepProps extends StepContentProps {
  onEditStep?: (step: number) => void;
}

export function ReviewStep({ formData, onEditStep }: ReviewStepProps) {
  const reviewSections = [
    {
      title: "Personal Information",
      stepIndex: 0,
      fields: [
        { label: "First Name", value: formData.first_name },
        { label: "Last Name", value: formData.last_name },
        { label: "Phone", value: formData.phone },
        { label: "Email", value: formData.email },
      ],
    },
    {
      title: "Academic Information",
      stepIndex: 1,
      fields: [
        { label: "Degree", value: formData.degree },
        { label: "Branch", value: formData.branch },
        { label: "Passing Year", value: formData.passing_year?.toString() },
        { label: "CGPA", value: formData.cgpa?.toString() },
        { label: "College ID", value: formData.college_id?.toString() },
      ],
    },
    {
      title: "Additional Information",
      stepIndex: 2,
      fields: [
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

