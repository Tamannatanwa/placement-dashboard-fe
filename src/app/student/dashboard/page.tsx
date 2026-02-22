"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserInfo } from "@/lib/utils/auth";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { JobStats } from "@/components/jobs/JobStats";
import { JobCard } from "@/components/jobs/JobCard";
import { studentsApi } from "@/lib/api/students";
import { savedJobsApi } from "@/lib/api/saved-jobs";
import { Job } from "@/types/job";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Student Dashboard Page
 * Shows dashboard statistics and recent jobs
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState<number | undefined>(undefined);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
    loadSavedJobs();
  }, []);

  // Calculate new jobs this week from recent jobs
  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newJobs = recentJobs.filter(
      (job) => new Date(job.created_at) >= weekAgo
    ).length;
    setNewThisWeek(newJobs);
  }, [recentJobs]);

  // Load dashboard data from API
  const loadDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const dashboardData = await studentsApi.getDashboard();
      
      // Set dashboard stats
      setRecentJobs(dashboardData.recent_jobs || []);
      setSavedJobsCount(dashboardData.saved_jobs_count || 0);
      
      // Get profile completeness from dashboard or student profile, with fallback
      const completeness = 
        dashboardData.profile_completeness ?? 
        dashboardData.student?.profile_completeness ?? 
        undefined;
      setProfileCompleteness(completeness);
      
      setNotificationsUnread(dashboardData.notifications_unread || 0);
      
      // Get total jobs count from recent jobs for stats
      setTotalJobs(dashboardData.recent_jobs?.length || 0);
      
      // Update saved jobs set from API count
      if (dashboardData.student?.saved_jobs_count) {
        setSavedJobsCount(dashboardData.student.saved_jobs_count);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      // Try to load profile completeness from profile API as fallback
      try {
        const profile = await studentsApi.getMyProfile();
        if (profile.profile_completeness !== undefined) {
          setProfileCompleteness(profile.profile_completeness);
        }
      } catch (profileError) {
        console.error("Error loading profile completeness:", profileError);
      }
      // Don't show error toast for dashboard - it's not critical if it fails
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Load saved jobs from API
  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
      setSavedJobsCount(response.total);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
      // Silently fail - saved jobs can be loaded later
    }
  };

  // Handle job application
  const handleApply = (jobId: string) => {
    // Navigate to job detail page
    router.push(`/jobs/${jobId}`);
  };

  // Handle save job using API
  const handleSave = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobs.has(jobId);
      
      if (isCurrentlySaved) {
        // Check if saved to get the saved job ID, then we'd need a delete endpoint
        // For now, we'll just show a message that unsaving requires the delete endpoint
        return;
      }

      // Save job via API
      await savedJobsApi.saveJob({
        job_id: jobId,
      });

      // Update local state
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      setSavedJobsCount((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error saving job:", error);
    }
  };

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your next career opportunity
          </p>
        </div>

        {/* Profile Completeness Alert */}
        {!isDashboardLoading && profileCompleteness !== undefined && (
          <Card className={profileCompleteness === 100 ? "border-green-500/20 bg-green-500/5" : "border-cyan-500/20 bg-cyan-500/5"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profileCompleteness === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  <CardTitle className="text-base">Profile Strength</CardTitle>
                </div>
                <span className="text-sm font-medium">{profileCompleteness}%</span>
              </div>
              <CardDescription>
                {profileCompleteness === 100
                  ? "Congratulations! Your profile is complete."
                  : profileCompleteness >= 85
                  ? "Your profile is looking great! Add skills to reach 100%"
                  : "Complete your profile to get better job recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompleteness} className="h-2 mb-4" />
              <Button
                onClick={() => router.push("/profile/wizard")}
                className={profileCompleteness === 100 
                  ? "w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                  : "w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                }
              >
                {profileCompleteness === 100 ? "Update Profile" : "Complete Profile"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <JobStats
          availableJobs={totalJobs}
          newThisWeek={newThisWeek}
          applied={0} // TODO: Get from applications API
          saved={savedJobsCount}
        />

        {/* Recent Jobs Section */}
        {recentJobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent Jobs</h2>
                <p className="text-sm text-muted-foreground">
                  Jobs you might be interested in
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentJobs.slice(0, 4).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  onSave={handleSave}
                  isSaved={savedJobs.has(job.id)}
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

