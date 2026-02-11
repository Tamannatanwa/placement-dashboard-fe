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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepContentProps } from "@/types/profile";
import { User } from "lucide-react";

export interface PersonalInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const PersonalInfoStep = forwardRef<PersonalInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const form = useForm<PersonalInfoFormData>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: {
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        phone: formData.phone || "",
        course: formData.course || "",
        current_module: formData.current_module || "",
        career_goal: formData.career_goal || "",
      },
      mode: "onChange",
    });

    // Sync form values when formData changes externally
    useEffect(() => {
      form.reset({
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        phone: formData.phone || "",
        course: formData.course || "",
        current_module: formData.current_module || "",
        career_goal: formData.career_goal || "",
      });
    }, [formData.first_name, formData.last_name, formData.phone, formData.course, formData.current_module, formData.career_goal, form]);

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

    const COURSE_OPTIONS = ["SoP", "SoB", "SoDA"];
    const CAREER_GOAL_OPTIONS = [
      "Full Stack Developer",
      "MERN Stack Developer",
      "Software Engineer",
      "Data Analyst",
    ];

    const setFieldValue = (name: keyof PersonalInfoFormData, value: string) => {
      form.setValue(name, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      handleChange();
    };

    const careerGoalValue = form.watch("career_goal") || "";
    const filteredCareerGoalOptions = CAREER_GOAL_OPTIONS.filter((goal) => {
      if (!careerGoalValue) return false;
      return goal.toLowerCase().includes(careerGoalValue.toLowerCase());
    });

  return (
    <Card className="border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950">
            <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Enter your basic personal details
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
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
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
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 9876543210"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formData.email && (
              <div className="pt-4 border-t">
                <FormLabel>Email</FormLabel>
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

            <div className="pt-4 border-t space-y-6">
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SoDA, DSA, Full Stack"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {COURSE_OPTIONS.map((course) => (
                        <Button
                          key={course}
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setFieldValue("course", course)}
                          className="h-7 text-xs"
                        >
                          {course}
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Module</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Module 06"
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
                name="career_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Goal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Wants to be a data analyst"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                    {filteredCareerGoalOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filteredCareerGoalOptions.map((goal) => (
                          <Button
                            key={goal}
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setFieldValue("career_goal", goal)}
                            className="h-7 text-xs"
                          >
                            {goal}
                          </Button>
                        ))}
                      </div>
                    )}
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


