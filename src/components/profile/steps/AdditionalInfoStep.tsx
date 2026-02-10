"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
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
import { Button } from "@/components/ui/button";
import { StepContentProps } from "@/types/profile";
import { FileText, Link as LinkIcon } from "lucide-react";

export interface AdditionalInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const AdditionalInfoStep = forwardRef<AdditionalInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const form = useForm<AdditionalInfoFormData>({
      resolver: zodResolver(additionalInfoSchema),
      defaultValues: {
        resume_url: formData.resume_url || "",
        portfolio_url: formData.portfolio_url || "",
        skills: formData.skills || "",
        preferred_work_mode: formData.preferred_work_mode || "",
        looking_for: formData.looking_for || "",
      },
      mode: "onChange",
    });

    // Sync form values when formData changes externally
    useEffect(() => {
      form.reset({
        resume_url: formData.resume_url || "",
        portfolio_url: formData.portfolio_url || "",
        skills: formData.skills || "",
        preferred_work_mode: formData.preferred_work_mode || "",
        looking_for: formData.looking_for || "",
      });
    }, [formData.resume_url, formData.portfolio_url, formData.skills, formData.preferred_work_mode, formData.looking_for, form]);

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

    // Suggestions for autocomplete
    const SKILL_SUGGESTIONS = [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Node.js",
      "Tableau",
      "PowerBI",
      "SQL",
      "MongoDB",
      "Express.js",
      "HTML",
      "CSS",
      "Data Analysis",
    ];

    const WORK_MODE_SUGGESTIONS = ["Remote", "In office", "Hybrid"];
    const LOOKING_FOR_SUGGESTIONS = ["Internship", "Full time", "Contract"];

    const addCommaSeparatedValue = (fieldName: keyof AdditionalInfoFormData, value: string) => {
      const current = (form.getValues(fieldName) as string | undefined) || "";
      const tokens = current
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (!tokens.includes(value)) {
        tokens.push(value);
      }
      const next = tokens.join(", ");
      form.setValue(fieldName, next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      handleChange();
    };

    const addSkill = (skill: string) => {
      addCommaSeparatedValue("skills", skill);
    };

    const skillsValue = form.watch("skills") || "";
    const lastSkillToken = skillsValue.split(",").pop()?.trim().toLowerCase() || "";
    const selectedSkills = skillsValue
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter((skill) => {
      const lower = skill.toLowerCase();
      if (selectedSkills.includes(lower)) return false;
      if (!lastSkillToken) return true;
      return lower.startsWith(lastSkillToken);
    });

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
                        placeholder="https://drive.google.com/file/d/..."
                        {...field}
                        className="h-11 pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Optional: Add a link to your resume (Google Drive or PDF)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio / GitHub Link</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://github.com/username or https://yourportfolio.com"
                        {...field}
                        className="h-11 pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Optional: Add a link to your portfolio or GitHub profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Tableau, Python, PowerBI, SQL"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your skills separated by commas
                  </FormDescription>
                  <FormMessage />
                  {filteredSkillSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filteredSkillSuggestions.map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => addSkill(skill)}
                          className="h-7 text-xs"
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_work_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Work Mode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Remote, In office"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your preferred work modes separated by commas
                  </FormDescription>
                  <FormMessage />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {WORK_MODE_SUGGESTIONS.map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => addCommaSeparatedValue("preferred_work_mode", mode)}
                        className="h-7 text-xs"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="looking_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Looking For</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Internship, Full time"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter what you're looking for separated by commas
                  </FormDescription>
                  <FormMessage />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LOOKING_FOR_SUGGESTIONS.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => addCommaSeparatedValue("looking_for", option)}
                        className="h-7 text-xs"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
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

AdditionalInfoStep.displayName = "AdditionalInfoStep";


