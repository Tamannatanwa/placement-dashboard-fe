"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { personalInfoSchema, PersonalInfoFormData } from "@/lib/validations/profile";
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
import { User } from "lucide-react";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const QUALIFICATION_OPTIONS = ["10th", "12th", "Diploma", "Graduation", "Post-Graduation", "PhD"];

export interface PersonalInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const PersonalInfoStep = forwardRef<PersonalInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const form = useForm<PersonalInfoFormData>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: {
        full_name: formData.full_name || "",
        phone: formData.phone || "",
        date_of_birth: formData.date_of_birth || "",
        gender: formData.gender || "",
        highest_qualification: formData.highest_qualification || "",
        course: formData.course || "",
        passing_year: formData.passing_year ?? undefined,
      },
      mode: "onChange",
    });

    // Sync form values only on initial load or when modal reopens (not on every keystroke)
    useEffect(() => {
      // Only reset if form is empty or if we're coming from a fresh load
      const currentValues = form.getValues();
      if (!currentValues.full_name && formData.full_name) {
        form.reset({
          full_name: formData.full_name || "",
          phone: formData.phone || "",
          date_of_birth: formData.date_of_birth || "",
          gender: formData.gender || "",
          highest_qualification: formData.highest_qualification || "",
          course: formData.course || "",
          passing_year: formData.passing_year ?? undefined,
        });
      }
    }, []); // Only run once on mount

    // Expose validation method to parent
    useImperativeHandle(ref, () => ({
      validate: async () => {
        const values = form.getValues();
        onUpdate(values);
        await form.trigger();
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
              <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter your basic personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onChange={handleChange} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91-9876543210"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormDescription>Include country code (e.g., +91-9876543210)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email ID */}
              {formData.email && (
                <div className="pt-4 border-t">
                  <FormLabel>Email ID</FormLabel>
                  <Input
                    value={formData.email}
                    disabled
                    className="mt-1.5 h-11 bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Email cannot be changed
                  </p>
                </div>
              )}

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-11"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        handleChange();
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select qualification" />
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

              {/* Course & Passing Year */}
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

PersonalInfoStep.displayName = "PersonalInfoStep";
