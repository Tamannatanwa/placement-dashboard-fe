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
        date_of_birth: formData.date_of_birth || "",
        gender: formData.gender || "",
        current_address: formData.current_address || "",
      },
      mode: "onChange",
    });

    // Sync form values when formData changes externally
    useEffect(() => {
      form.reset({
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        phone: formData.phone || "",
        date_of_birth: formData.date_of_birth || "",
        gender: formData.gender || "",
        current_address: formData.current_address || "",
      });
    }, [
      formData.first_name,
      formData.last_name,
      formData.phone,
      formData.date_of_birth,
      formData.gender,
      formData.current_address,
      form,
    ]);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} className="h-11" />
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
                        <Input placeholder="Doe" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Current Address */}
              <FormField
                control={form.control}
                name="current_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Address</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="123 Main Street, City, State, Country - PIN Code"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

PersonalInfoStep.displayName = "PersonalInfoStep";
