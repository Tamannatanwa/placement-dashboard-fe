"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { academicInfoSchema, AcademicInfoFormData } from "@/lib/validations/profile";
import { ClientOnly } from "@/components/ui/ClientOnly";
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

const DEGREE_OPTIONS = [
  "B.Tech",
  "M.Tech",
  "B.E",
  "M.E",
  "B.Sc",
  "M.Sc",
  "BBA",
  "MBA",
  "BCA",
  "MCA",
  "Other",
];

const BRANCH_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Other",
];

export interface AcademicInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const AcademicInfoStep = forwardRef<AcademicInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const form = useForm<AcademicInfoFormData>({
      resolver: zodResolver(academicInfoSchema),
      defaultValues: {
        degree: formData.degree || "",
        branch: formData.branch || "",
        passing_year: formData.passing_year,
        cgpa: formData.cgpa,
        educational_qualification: formData.educational_qualification || "",
        institute_name: formData.institute_name || "",
        status: formData.status,
      },
      mode: "onChange",
    });

    // Sync form values when formData changes externally
    useEffect(() => {
      form.reset({
        degree: formData.degree || "",
        branch: formData.branch || "",
        passing_year: formData.passing_year,
        cgpa: formData.cgpa,
        educational_qualification: formData.educational_qualification || "",
        institute_name: formData.institute_name || "",
        status: formData.status,
      });
    }, [formData.degree, formData.branch, formData.passing_year, formData.cgpa, formData.educational_qualification, formData.institute_name, formData.status, form]);

    // Expose validation method to parent
    useImperativeHandle(ref, () => ({
      validate: async () => {
        // Always save current values, validate format only if fields have values
        const values = form.getValues();
        onUpdate(values);
        // Validate format but don't block if empty
        const isValid = await form.trigger();
        return true; // Always allow navigation
      },
    }));

    // Update parent when form changes
    const handleChange = () => {
      const values = form.getValues();
      onUpdate(values);
    };

  return (
    <Card className="border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950">
            <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              Provide your academic details and achievements
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onChange={handleChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <ClientOnly
                      fallback={
                        <div className="h-11 border border-input rounded-md bg-background px-3 py-2 text-sm">
                          Loading...
                        </div>
                      }
                    >
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEGREE_OPTIONS.map((degree) => (
                            <SelectItem key={degree} value={degree}>
                              {degree}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ClientOnly>
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
                    <ClientOnly
                      fallback={
                        <div className="h-11 border border-input rounded-md bg-background px-3 py-2 text-sm">
                          Loading...
                        </div>
                      }
                    >
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BRANCH_OPTIONS.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ClientOnly>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="passing_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Year</FormLabel>
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

              <FormField
                control={form.control}
                name="cgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGPA</FormLabel>
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
                    <FormDescription>
                      CGPA out of 10
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {formData.college_id && (
              <div className="pt-4 border-t">
                <FormLabel>College ID</FormLabel>
                <Input
                  value={formData.college_id}
                  disabled
                  className="mt-1.5 h-11 bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1.5">
                  College ID cannot be changed
                </p>
              </div>
            )}

            <div className="pt-4 border-t space-y-6">
              <FormField
                control={form.control}
                name="educational_qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Qualification</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 12th pass, Graduation"
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
                name="institute_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institute Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., NavGurukul"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Status</FormLabel>
                    <ClientOnly
                      fallback={
                        <div className="h-11 border border-input rounded-md bg-background px-3 py-2 text-sm">
                          Loading...
                        </div>
                      }
                    >
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Pursuing">Pursuing</SelectItem>
                        </SelectContent>
                      </Select>
                    </ClientOnly>
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

