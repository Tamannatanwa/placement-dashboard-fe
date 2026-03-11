"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentsApi } from "@/lib/api/students";
import { StudentProfile } from "@/types/student-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Link as LinkIcon,
  Edit,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Format backend qualification value (stored in lowercase) to user-friendly label
const formatQualification = (value?: string) => {
  if (!value) return undefined;
  const qual = value.toLowerCase();
  const map: Record<string, string> = {
    "10th": "10th",
    "12th": "12th",
    "diploma": "Diploma",
    "graduation": "Graduation",
    "post-graduation": "Post-Graduation",
    "phd": "PhD",
  };
  return map[qual] || value;
};

export default function StudentProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentsApi.getMyProfile();
      setProfile(data);
    } catch (error: any) {
      toast.error("Failed to load profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingResume(true);
    try {
      // Use separate resume API
      await studentsApi.uploadResume(file);
      await loadProfile(); // Reload profile to get updated resume_url
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
      event.target.value = '';
    }
  };

  const handleResumeDelete = async () => {
    if (!profile?.resume_url) return;

    setIsDeletingResume(true);
    try {
      // Use separate resume API
      await studentsApi.deleteResume();
      await loadProfile(); // Reload profile
      toast.success("Resume deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resume");
    } finally {
      setIsDeletingResume(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Profile not found. Please complete your profile.
            </p>
            <Button 
              onClick={() => router.push("/profile/wizard")}
              className="w-full"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resumeFileName = profile.resume_url 
    ? profile.resume_url.split('/').pop() || 'resume.pdf'
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Strength - at top */}
        {profile.profile_completeness !== undefined && (
          <Card className={`mb-6 ${profile.profile_completeness === 100 ? "border-green-500/20 bg-green-500/5" : "border-cyan-500/20 bg-cyan-500/5"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profile.profile_completeness === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </div>
                <span className="text-sm font-medium">{profile.profile_completeness}%</span>
              </div>
              <CardDescription>
                {profile.profile_completeness === 100
                  ? "Congratulations! Your profile is complete."
                  : profile.profile_completeness >= 85
                  ? "Your profile is looking great! Add skills to reach 100%"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profile.profile_completeness} className="h-2 mb-4" />
              <Button
                onClick={() => router.push("/profile/wizard")}
                className={profile.profile_completeness === 100 
                  ? "w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                  : "w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                }
              >
                {profile.profile_completeness === 100 ? "Update Profile" : "Complete Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your profile information
            </p>
          </div>
          <Button onClick={() => router.push("/profile/wizard")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div> */}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.email || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{profile.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle>Academic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Highest Qualification</p>
                <p className="font-medium">
                  {formatQualification(profile.highest_qualification) || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{profile.branch || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passing Year</p>
                <p className="font-medium">{profile.passing_year || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CGPA</p>
                <p className="font-medium">{profile.cgpa || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Section */}
        {/* <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle>Resume</CardTitle>
            </div>
            <CardDescription>
              Upload your resume in PDF format (max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.resume_url ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resumeFileName}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.resume_url}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profile.resume_url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResumeDelete}
                      disabled={isDeletingResume}
                    >
                      {isDeletingResume ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  You can replace your resume by uploading a new one below
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isUploadingResume}
                  className="hidden"
                  id="resume-upload-view"
                />
                <label
                  htmlFor="resume-upload-view"
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
            {profile.resume_url && (
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isUploadingResume}
                  className="hidden"
                  id="resume-replace"
                />
                <label htmlFor="resume-replace">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={isUploadingResume}
                  >
                    <span>
                      {isUploadingResume ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Replace Resume
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </CardContent>
        </Card> */}

        {/* Additional Information */}
        {(profile as any).portfolio_url || (profile as any).skills ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <CardTitle>Additional Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profile as any).portfolio_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Portfolio / GitHub</p>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={(profile as any).portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {(profile as any).portfolio_url}
                    </a>
                  </div>
                </div>
              )}
              {(profile as any).skills && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {String((profile as any).skills)
                      .split(',')
                      .map((skill) => skill.trim())
                      .filter(Boolean)
                      .map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

