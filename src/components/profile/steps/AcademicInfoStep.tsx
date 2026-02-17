"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { academicInfoSchema, AcademicInfoFormData } from "@/lib/validations/profile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepContentProps } from "@/types/profile";
import { GraduationCap } from "lucide-react";

const QUALIFICATION_OPTIONS = ["10th", "12th", "Diploma", "Graduation", "Post-Graduation", "PhD"];

// Helper function to normalize qualification value from backend to frontend format
const normalizeQualification = (value: string | undefined): string => {
  if (!value) return "";
  const qual = value.toLowerCase();
  const qualMap: { [key: string]: string } = {
    '10th': '10th',
    '12th': '12th',
    'diploma': 'Diploma',
    'graduation': 'Graduation',
    'post-graduation': 'Post-Graduation',
    'phd': 'PhD'
  };
  return qualMap[qual] || value;
};

export interface AcademicInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const AcademicInfoStep = forwardRef<AcademicInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const form = useForm<AcademicInfoFormData>({
      resolver: zodResolver(academicInfoSchema),
      defaultValues: {
        highest_qualification: normalizeQualification(formData.highest_qualification),
        college_name: formData.college_name || "",
        course: formData.course || "",
        branch: formData.branch || "",
        passing_year: formData.passing_year,
        percentage: formData.percentage,
        cgpa: formData.cgpa,
      },
      mode: "onChange",
    });

    // Sync form values when formData changes externally
    useEffect(() => {
      form.reset({
        highest_qualification: normalizeQualification(formData.highest_qualification),
        college_name: formData.college_name || "",
        course: formData.course || "",
        branch: formData.branch || "",
        passing_year: formData.passing_year,
        percentage: formData.percentage,
        cgpa: formData.cgpa,
      });
    }, [
      formData.highest_qualification,
      formData.college_name,
      formData.course,
      formData.branch,
      formData.passing_year,
      formData.percentage,
      formData.cgpa,
      form,
    ]);

    // Expose validation method to parent
    useImperativeHandle(ref, () => ({
      validate: async () => {
        const values = form.getValues();
        // Ensure highest_qualification is properly included and not empty string
        const updatedValues = {
          ...values,
          highest_qualification: values.highest_qualification && values.highest_qualification.trim() ? values.highest_qualification.trim() : undefined,
        };
        onUpdate(updatedValues);
        await form.trigger();
        return true;
      },
    }));

    // Update parent when form changes
    const handleChange = () => {
      const values = form.getValues();
      // Ensure highest_qualification is properly included
      onUpdate({
        ...values,
        highest_qualification: values.highest_qualification || undefined,
      });
    };

    return (
      <Card className="border-cyan-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950">
              <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle>Education Details</CardTitle>
              <CardDescription>Provide your academic information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onChange={handleChange} className="space-y-6">
              {/* Highest Qualification */}
              <FormField
                control={form.control}
                name="highest_qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Qualification</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Immediately update parent - get all form values after onChange
                        setTimeout(() => {
                          handleChange();
                        }, 0);
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select qualification (10th / 12th / Diploma / Graduation)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUALIFICATION_OPTIONS.map((qual) => (
                          <SelectItem key={qual} value={qual}>
                            {qual}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* College / University Name */}
              <FormField
                control={form.control}
                name="college_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College / University Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ABC Engineering College"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course / Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Bachelor of Technology"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Computer Science and Engineering"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Year of Passing */}
              <FormField
                control={form.control}
                name="passing_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Passing</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          field.onChange(value);
                          handleChange();
                        }}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Percentage / CGPA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="85.5"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            field.onChange(value);
                            handleChange();
                          }}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription>Percentage out of 100</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cgpa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CGPA (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          placeholder="8.5"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : undefined;
                            field.onChange(value);
                            handleChange();
                          }}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription>CGPA out of 10</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

AcademicInfoStep.displayName = "AcademicInfoStep";
