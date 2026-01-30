"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { additionalInfoSchema, AdditionalInfoFormData } from "@/lib/validations/profile";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepContentProps } from "@/types/profile";
import { FileText, Link as LinkIcon } from "lucide-react";

export function AdditionalInfoStep({ formData, onUpdate, errors }: StepContentProps) {
  const form = useForm<AdditionalInfoFormData>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      resume_url: formData.resume_url || "",
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
            <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Add your resume URL or other relevant links (optional)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onChange={handleChange} className="space-y-6">
            <FormField
              control={form.control}
              name="resume_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://example.com/resume.pdf"
                        {...field}
                        className="h-11 pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Optional: Add a link to your resume or portfolio
                  </FormDescription>
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


