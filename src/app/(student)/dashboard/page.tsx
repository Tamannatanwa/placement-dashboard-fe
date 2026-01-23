"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Bell, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobStats } from "@/components/jobs/JobStats";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Student Dashboard Page
 * Shows job listings with search, filters, and statistics
 */
export default function StudentDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [totalJobs, setTotalJobs] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [recommendationsAvailable, setRecommendationsAvailable] = useState(0);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  // Load jobs when filters change
  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Calculate new jobs this week
  useEffect(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newJobs = jobs.filter(
      (job) => new Date(job.created_at) >= weekAgo
    ).length;
    setNewThisWeek(newJobs);
  }, [jobs]);

  // Load dashboard data from API
  const loadDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const dashboardData = await studentsApi.getDashboard();
      
      // Set dashboard stats
      setRecentJobs(dashboardData.recent_jobs || []);
      setSavedJobsCount(dashboardData.saved_jobs_count || 0);
      setProfileCompleteness(dashboardData.profile_completeness || 0);
      setNotificationsUnread(dashboardData.notifications_unread || 0);
      setRecommendationsAvailable(dashboardData.recommendations_available || 0);
      
      // Update saved jobs set from API count (we'll sync this with saved jobs API later)
      if (dashboardData.student?.saved_jobs_count) {
        setSavedJobsCount(dashboardData.student.saved_jobs_count);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      // Don't show error toast for dashboard - it's not critical if it fails
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // Load jobs from API
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getJobs(filters);
      setJobs(response.items);
      setTotalJobs(response.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search - filter by skills or title
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If API supports search, we can add it to filters
    // For now, we'll filter client-side
    if (query.trim()) {
      // Update filters with skills search if it looks like skills
      const skills = query.split(",").map((s) => s.trim()).filter(Boolean);
      if (skills.length > 0) {
        setFilters({
          ...filters,
          skills: skills.join(","),
          page: 1, // Reset to first page
        });
      }
    } else {
      // Clear skills filter when search is cleared
      const { skills, ...restFilters } = filters;
      setFilters({ ...restFilters, page: 1 });
    }
  };

  // Handle job application with view tracking
  const handleApply = async (jobId: string) => {
    try {
      // Track job view before navigating
      const jobIdNum = parseInt(jobId, 10);
      if (!isNaN(jobIdNum)) {
        await studentsApi.trackJobView(jobIdNum, {
          job_id: jobIdNum,
          duration_seconds: 0, // We'll track duration on the detail page
          source: "dashboard",
        });
      }
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Error tracking job view:", error);
    }
    
    // Navigate to job detail or application page
    router.push(`/student/jobs/${jobId}`);
  };

  // Handle save job
  const handleSave = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success("Job removed from saved");
      } else {
        newSet.add(jobId);
        toast.success("Job saved");
      }
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("savedJobs", JSON.stringify(Array.from(newSet)));
      }
      return newSet;
    });
  };

  // Load saved jobs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedJobs");
      if (saved) {
        try {
          setSavedJobs(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Error loading saved jobs:", e);
        }
      }
    }
  }, []);

  // Filter jobs by search query (client-side for now)
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills_required?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [jobs, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
            <span className="font-bold text-xl">PlaceHub</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#jobs" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Jobs
            </a>
            <a href="/student/applications" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Applications
            </a>
            <a href="#companies" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Companies
            </a>
            <a href="#resources" className="text-sm font-medium hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationsUnread > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-cyan-600 rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
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
        {profileCompleteness < 100 && (
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <CardTitle className="text-base">Complete Your Profile</CardTitle>
                </div>
                <span className="text-sm font-medium">{profileCompleteness}%</span>
              </div>
              <CardDescription>
                Complete your profile to get better job recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={profileCompleteness} className="h-2" />
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

        {/* Search Bar */}
        <div className="max-w-2xl">
          <JobSearch
            onSearch={handleSearch}
            placeholder="Search jobs by title, company, or skills..."
          />
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-6">
          <JobFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClear={() => {
              setFilters({
                page: 1,
                size: 20,
                sort_by: "created_at",
                sort_order: "desc",
              });
            }}
          />
        </div>

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

        {/* All Jobs Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Jobs Found
          </h2>
          <Select
            value={filters.sort_by || "created_at"}
            onValueChange={(value: "created_at" | "title" | "location" | "view_count") => {
              setFilters({ ...filters, sort_by: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Latest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="view_count">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading jobs...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No jobs found. Try adjusting your filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onSave={handleSave}
                isSaved={savedJobs.has(job.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalJobs > (filters.size || 20) && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page || 1} of {Math.ceil(totalJobs / (filters.size || 20))}
            </span>
            <Button
              variant="outline"
              disabled={(filters.page || 1) >= Math.ceil(totalJobs / (filters.size || 20))}
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

