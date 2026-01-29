"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { studentsApi } from "@/lib/api/students";
import { StudentProfile, ProfileCompletenessResponse } from "@/lib/api/students";
import { toast } from "sonner";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  degree: z.string().min(1, "Degree is required"),
  branch: z.string().min(1, "Branch is required"),
  passing_year: z.number().min(2020).max(2030),
  cgpa: z.number().min(0).max(10),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompletenessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCompleteness, setIsLoadingCompleteness] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      degree: "",
      branch: "",
      passing_year: new Date().getFullYear(),
      cgpa: 0,
    },
  });

  useEffect(() => {
    loadProfile();
    loadProfileCompleteness();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await studentsApi.getMyProfile();
      setProfile(data);
      
      // Populate form with existing data
      form.reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        degree: data.degree || "",
        branch: data.branch || "",
        passing_year: data.passing_year || new Date().getFullYear(),
        cgpa: data.cgpa || 0,
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfileCompleteness = async () => {
    setIsLoadingCompleteness(true);
    try {
      const data = await studentsApi.getProfileCompleteness();
      setCompleteness(data);
    } catch (error: any) {
      console.error("Error loading profile completeness:", error);
    } finally {
      setIsLoadingCompleteness(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const updated = await studentsApi.updateMyProfile(data);
      setProfile(updated);
      toast.success("Profile updated successfully");
      
      // Reload completeness after update
      await loadProfileCompleteness();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Completeness Card */}
        {completeness && (
          <Card className="mb-6 border-cyan-500/20 bg-cyan-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {completeness.is_complete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <CardTitle className="text-base">Profile Completeness</CardTitle>
                </div>
                <span className="text-sm font-medium">{completeness.percentage}%</span>
              </div>
              <CardDescription>
                {completeness.is_complete
                  ? "Your profile is complete!"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={completeness.percentage} className="h-2 mb-4" />
              
              {completeness.missing_fields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Missing Fields:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {completeness.missing_fields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}

              {completeness.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Suggestions:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {completeness.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Update your profile information to get better job matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
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
                          <Input placeholder="Doe" {...field} />
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
                        <Input type="tel" placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="B.Tech">B.Tech</SelectItem>
                            <SelectItem value="M.Tech">M.Tech</SelectItem>
                            <SelectItem value="B.E">B.E</SelectItem>
                            <SelectItem value="M.E">M.E</SelectItem>
                            <SelectItem value="B.Sc">B.Sc</SelectItem>
                            <SelectItem value="M.Sc">M.Sc</SelectItem>
                            <SelectItem value="BBA">BBA</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
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

                {/* Read-only fields */}
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <FormLabel>Email</FormLabel>
                      <Input value={profile.email || ""} disabled className="mt-1" />
                      <FormDescription className="mt-1">
                        Email cannot be changed
                      </FormDescription>
                    </div>
                    <div>
                      <FormLabel>College ID</FormLabel>
                      <Input value={profile.college_id || ""} disabled className="mt-1" />
                      <FormDescription className="mt-1">
                        College ID cannot be changed
                      </FormDescription>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


