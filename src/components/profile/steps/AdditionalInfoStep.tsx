"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepContentProps } from "@/types/profile";
import { FileText, Link as LinkIcon, Upload, X, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { studentsApi } from "@/lib/api/students";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const EXPERIENCE_TYPES = ["Fresher", "Experienced"];
const JOB_TYPES = ["Internship", "Full-Time", "Part-Time"];
const WORK_MODES = ["Remote", "Hybrid", "Office"];
const PROFICIENCY_LEVELS = ["beginner", "proficient", "fluent", "native"];
const MAX_PREFERRED_JOB_ROLES = 3;

export interface AdditionalInfoStepHandle {
  validate: () => Promise<boolean>;
}

export const AdditionalInfoStep = forwardRef<AdditionalInfoStepHandle, StepContentProps>(
  ({ formData, onUpdate, errors }, ref) => {
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [isDeletingResume, setIsDeletingResume] = useState(false);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);
    const [techSkillInput, setTechSkillInput] = useState("");
    const [softSkillInput, setSoftSkillInput] = useState("");
    const [jobRoleInput, setJobRoleInput] = useState("");
    const [locationInput, setLocationInput] = useState("");

    const form = useForm<AdditionalInfoFormData>({
      resolver: zodResolver(additionalInfoSchema),
      defaultValues: {
        technical_skills: formData.technical_skills || [],
        soft_skills: formData.soft_skills || [],
        experience_type: formData.experience_type || undefined,
        languages: formData.languages || [],
        job_type: formData.job_type || [],
        work_mode: formData.work_mode || [],
        preferred_job_role: formData.preferred_job_role || [],
        preferred_location: formData.preferred_location || [],
        expected_salary: formData.expected_salary,
        github_profile: formData.github_profile || "",
        linkedin_profile: formData.linkedin_profile || "",
        portfolio_url: formData.portfolio_url || "",
        coding_platforms: formData.coding_platforms || {},
        resume_url: formData.resume_url || "",
      },
      mode: "onChange",
    });

    // Sync form values only on initial load (not on every keystroke)
    useEffect(() => {
      const currentValues = form.getValues();
      if (!currentValues.technical_skills?.length && formData.technical_skills?.length) {
        // Only reset if form is empty and we have data to load
        const resetData = {
          technical_skills: Array.isArray(formData.technical_skills) ? formData.technical_skills : [],
          soft_skills: Array.isArray(formData.soft_skills) ? formData.soft_skills : [],
          experience_type: (formData.experience_type === "fresher" || formData.experience_type === "experienced") 
            ? formData.experience_type 
            : undefined,
          languages: Array.isArray(formData.languages) ? formData.languages : [],
          job_type: Array.isArray(formData.job_type) ? formData.job_type : [],
          work_mode: Array.isArray(formData.work_mode) ? formData.work_mode : [],
          preferred_job_role: Array.isArray(formData.preferred_job_role) ? formData.preferred_job_role : [],
          preferred_location: Array.isArray(formData.preferred_location) ? formData.preferred_location : [],
          expected_salary: formData.expected_salary,
          github_profile: formData.github_profile || "",
          linkedin_profile: formData.linkedin_profile || "",
          portfolio_url: formData.portfolio_url || "",
          coding_platforms: formData.coding_platforms || {},
          resume_url: formData.resume_url || "",
        };
        
        form.reset(resetData);
        if (formData.resume_url) {
          const urlParts = formData.resume_url.split('/');
          setResumeFileName(urlParts[urlParts.length - 1] || 'resume.pdf');
        } else {
          setResumeFileName(null);
        }
      }
    }, []); // Only run once on mount

    // Helper function to normalize form values (convert empty strings to undefined)
    const normalizeFormValues = (values: any) => {
      return {
        ...values,
        experience_type: values.experience_type === "" ? undefined : values.experience_type,
        internship_details: [],
        projects: [],
        languages: values.languages?.map((lang: any) => ({
          ...lang,
          proficiency_level: lang.proficiency_level === "" ? undefined : lang.proficiency_level,
        })),
      };
    };

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const values = form.getValues();
        onUpdate(normalizeFormValues(values));
        await form.trigger();
        return true;
      },
    }));

    const handleChange = () => {
      const values = form.getValues();
      onUpdate(normalizeFormValues(values));
    };

    // Skills handlers
    const addTechSkill = () => {
      if (techSkillInput.trim()) {
        const current = form.getValues("technical_skills") || [];
        if (!current.includes(techSkillInput.trim())) {
          form.setValue("technical_skills", [...current, techSkillInput.trim()]);
          setTechSkillInput("");
          handleChange();
        }
      }
    };

    const removeTechSkill = (skill: string) => {
      const current = form.getValues("technical_skills") || [];
      form.setValue("technical_skills", current.filter((s) => s !== skill));
      handleChange();
    };

    const addSoftSkill = () => {
      if (softSkillInput.trim()) {
        const current = form.getValues("soft_skills") || [];
        if (!current.includes(softSkillInput.trim())) {
          form.setValue("soft_skills", [...current, softSkillInput.trim()]);
          setSoftSkillInput("");
          handleChange();
        }
      }
    };

    const removeSoftSkill = (skill: string) => {
      const current = form.getValues("soft_skills") || [];
      form.setValue("soft_skills", current.filter((s) => s !== skill));
      handleChange();
    };

    // Resume handlers
    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error("Only PDF files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setIsUploadingResume(true);
      try {
        const response = await studentsApi.uploadResume(file);
        form.setValue("resume_url", response.resume_url);
        setResumeFileName(file.name);
        onUpdate(normalizeFormValues({ ...form.getValues(), resume_url: response.resume_url }));
        toast.success("Resume uploaded successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to upload resume");
      } finally {
        setIsUploadingResume(false);
        event.target.value = '';
      }
    };

    const handleResumeDelete = async () => {
      if (!formData.resume_url) return;
      setIsDeletingResume(true);
      try {
        await studentsApi.deleteResume();
        form.setValue("resume_url", "");
        setResumeFileName(null);
        onUpdate(normalizeFormValues({ ...form.getValues(), resume_url: "" }));
        toast.success("Resume deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete resume");
      } finally {
        setIsDeletingResume(false);
      }
    };

    const addLanguage = () => {
      const current = form.getValues("languages") || [];
      form.setValue("languages", [...current, { language: "", proficiency_level: "beginner" }]);
      handleChange();
    };

    const removeLanguage = (index: number) => {
      const current = form.getValues("languages") || [];
      form.setValue("languages", current.filter((_, i) => i !== index));
      handleChange();
    };

    const addJobRole = () => {
      if (jobRoleInput.trim()) {
        const current = form.getValues("preferred_job_role") || [];
        if (current.length >= MAX_PREFERRED_JOB_ROLES) {
          toast.error("You can add only up to 3 preferred job roles");
          return;
        }
        if (!current.includes(jobRoleInput.trim())) {
          form.setValue("preferred_job_role", [...current, jobRoleInput.trim()]);
          setJobRoleInput("");
          handleChange();
        }
      }
    };

    const addLocation = () => {
      if (locationInput.trim()) {
        const current = form.getValues("preferred_location") || [];
        if (!current.includes(locationInput.trim())) {
          form.setValue("preferred_location", [...current, locationInput.trim()]);
          setLocationInput("");
          handleChange();
        }
      }
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
              <CardDescription>Skills, Experience, Preferences & Resume</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onChange={handleChange} className="space-y-8">
              {/* Skills Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                
                {/* Technical Skills */}
                <FormField
                  control={form.control}
                  name="technical_skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Skills (e.g. Java, Python, React, MS Excel)</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add technical skill"
                          value={techSkillInput}
                          onChange={(e) => setTechSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTechSkill();
                            }
                          }}
                          className="h-11"
                        />
                        <Button type="button" onClick={addTechSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {skill}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTechSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Soft Skills */}
                <FormField
                  control={form.control}
                  name="soft_skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soft Skills (Communication, Teamwork, Time Management)</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add soft skill"
                          value={softSkillInput}
                          onChange={(e) => setSoftSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSoftSkill();
                            }
                          }}
                          className="h-11"
                        />
                        <Button type="button" onClick={addSoftSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {skill}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeSoftSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Experience Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Select your experience based on the current role. If your previous experience is in a different (non-related) field, please choose “Fresher”</h3>
                
                <FormField
                  control={form.control}
                  name="experience_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fresher / Experienced</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChange();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select experience type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPERIENCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Languages Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Language & Communication</h3>
                  <Button type="button" onClick={addLanguage} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Language
                  </Button>
                </div>
                {form.watch("languages")?.map((lang, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Language {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Known Language (e.g., English)"
                        value={lang.language || ""}
                        onChange={(e) => {
                          const current = form.getValues("languages") || [];
                          current[index].language = e.target.value;
                          form.setValue("languages", current);
                          handleChange();
                        }}
                      />
                      <Select
                        value={lang.proficiency_level || "beginner"}
                        onValueChange={(value) => {
                          const current = form.getValues("languages") || [];
                          current[index].proficiency_level = value as "" | "beginner" | "proficient" | "fluent" | "native" | undefined;
                          form.setValue("languages", current);
                          handleChange();
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Proficiency Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Job Preferences Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Job Preferences</h3>
                
                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type (Internship / Full-Time / Part-Time)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const current = field.value || [];
                          if (!current.includes(value)) {
                            field.onChange([...current, value]);
                            handleChange();
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JOB_TYPES.filter((type) => !(field.value || []).includes(type)).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {type}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange((field.value || []).filter((_, i) => i !== idx));
                                  handleChange();
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="work_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Mode (Remote / Hybrid / Office)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const current = field.value || [];
                          if (!current.includes(value)) {
                            field.onChange([...current, value]);
                            handleChange();
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select work mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORK_MODES.filter((mode) => !(field.value || []).includes(mode)).map((mode) => (
                            <SelectItem key={mode} value={mode}>
                              {mode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((mode, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {mode}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange((field.value || []).filter((_, i) => i !== idx));
                                  handleChange();
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_job_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Job Role</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add preferred job role"
                          value={jobRoleInput}
                          onChange={(e) => setJobRoleInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addJobRole();
                            }
                          }}
                          disabled={(field.value || []).length >= MAX_PREFERRED_JOB_ROLES}
                          className="h-11"
                        />
                        <Button
                          type="button"
                          onClick={addJobRole}
                          size="sm"
                          disabled={(field.value || []).length >= MAX_PREFERRED_JOB_ROLES}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormDescription>You can add up to 3 preferred job roles</FormDescription>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((role, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {role}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange((field.value || []).filter((_, i) => i !== idx));
                                  handleChange();
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add preferred location"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addLocation();
                            }
                          }}
                          className="h-11"
                        />
                        <Button type="button" onClick={addLocation} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {(field.value || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(field.value || []).map((location, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {location}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange((field.value || []).filter((_, i) => i !== idx));
                                  handleChange();
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Salary (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="800000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                            field.onChange(value);
                            handleChange();
                          }}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription>Annual salary in INR</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Technical Profile Links Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Technical Profile Links</h3>
                
                <FormField
                  control={form.control}
                  name="github_profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://github.com/username"
                            {...field}
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            {...field}
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio / Personal Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="url"
                            placeholder="https://yourname.dev"
                            {...field}
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Coding Platforms (LeetCode, HackerRank)</FormLabel>
                  <div className="space-y-2 mt-2">
                    {["LeetCode", "HackerRank", "CodeChef", "Codeforces"].map((platform) => (
                      <Input
                        key={platform}
                        placeholder={`${platform} username`}
                        value={form.watch("coding_platforms")?.[platform] || ""}
                        onChange={(e) => {
                          const current = form.getValues("coding_platforms") || {};
                          form.setValue("coding_platforms", {
                            ...current,
                            [platform]: e.target.value,
                          });
                          handleChange();
                        }}
                        className="h-11"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              {/* <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Document Upload</h3>
                
                <FormField
                  control={form.control}
                  name="resume_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Upload (PDF)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {formData.resume_url ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{resumeFileName || "resume.pdf"}</p>
                                  <p className="text-xs text-muted-foreground truncate">{formData.resume_url}</p>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleResumeDelete}
                                disabled={isDeletingResume}
                                className="ml-2 flex-shrink-0"
                              >
                                {isDeletingResume ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResumeUpload}
                                disabled={isUploadingResume}
                                className="hidden"
                                id="resume-upload"
                              />
                              <label
                                htmlFor="resume-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                {isUploadingResume ? (
                                  <>
                                    <Loader2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                                    <span className="text-sm text-muted-foreground">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                                    <div>
                                      <p className="text-sm font-medium">Click to upload resume</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        PDF only, max 5MB
                                      </p>
                                    </div>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                          <input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload your resume in PDF format (max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
);

AdditionalInfoStep.displayName = "AdditionalInfoStep";
