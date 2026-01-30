"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { StepContentProps } from "@/types/profile";
import { User } from "lucide-react";

export function PersonalInfoStep({ formData, onUpdate, errors }: StepContentProps) {
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: formData.first_name || "",
      last_name: formData.last_name || "",
      phone: formData.phone || "",
    },
    mode: "onChange",
  });

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
                    <FormLabel>First Name *</FormLabel>
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
                    <FormLabel>Last Name *</FormLabel>
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
                  <FormLabel>Phone Number *</FormLabel>
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


