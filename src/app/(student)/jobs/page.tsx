"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { savedJobsApi } from "@/lib/api/saved-jobs";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function JobsPage() {
  const router = useRouter();

  // Profile + simple stats (left side card)
  const [profileCompleteness, setProfileCompleteness] = useState<number | undefined>(undefined);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Recommended jobs
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  // All jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Saved jobs (for heart icon state)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Tabs
  const [activeTab, setActiveTab] = useState<"recommended" | "all">("recommended");

  // Initial load: profile, saved jobs, recommendations
  useEffect(() => {
    void loadProfileCard();
    void loadSavedJobs();
    void loadRecommendedJobs();
  }, []);

  // Load all jobs when filters change (for "All" tab)
  useEffect(() => {
    void loadJobs();
  }, [filters]);

  const loadProfileCard = async () => {
    setIsProfileLoading(true);
    try {
      const dashboard = await studentsApi.getDashboard();

      const completeness =
        dashboard.profile_completeness ??
        dashboard.student?.profile_completeness ??
        undefined;
      setProfileCompleteness(completeness);

      if (typeof dashboard.saved_jobs_count === "number") {
        setSavedJobsCount(dashboard.saved_jobs_count);
      } else if (typeof dashboard.student?.saved_jobs_count === "number") {
        setSavedJobsCount(dashboard.student.saved_jobs_count);
      }
    } catch (error: any) {
      // Fallback: try profile API for completeness only
      try {
        const profile = await studentsApi.getMyProfile();
        if (typeof profile.profile_completeness === "number") {
          setProfileCompleteness(profile.profile_completeness);
        }
      } catch (profileError) {
        console.error("Error loading profile completeness:", profileError);
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
      if (typeof response.total === "number") {
        setSavedJobsCount(response.total);
      }
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
    }
  };

  const loadRecommendedJobs = async () => {
    setIsLoadingRecommended(true);
    try {
      const response = await studentsApi.getRecommendedJobs(20, 0);
      const recJobs = response.recommendations.map((rec) => rec.job);
      setRecommendedJobs(recJobs);
    } catch (error: any) {
      console.error("Error loading recommended jobs:", error);
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  const loadJobs = async () => {
    const currentPage = filters.page || 1;
    const isFirstPage = currentPage === 1;

    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await jobsApi.getJobs(filters);

      setJobs((prevJobs) => {
        if (isFirstPage) {
          return response.items;
        }

        const existingIds = new Set(prevJobs.map((job) => job.id));
        const newItems = response.items.filter((job) => !existingIds.has(job.id));
        return [...prevJobs, ...newItems];
      });

      setTotalJobs(response.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
      console.error("Error loading jobs:", error);
    } finally {
      if (isFirstPage) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  // Handle text search purely on the client side (title/company/skills_required).
  // We intentionally do NOT send this query as a backend `skills` filter,
  // because that expects exact skill names and can hide many valid jobs.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleSave = async (jobId: string) => {
    try {
      const isCurrentlySaved = savedJobs.has(jobId);

      if (isCurrentlySaved) {
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      await savedJobsApi.saveJob({ job_id: jobId });

      setSavedJobs((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });
      setSavedJobsCount((prev) => prev + 1);
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to save job",
      );
    }
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills_required?.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [jobs, searchQuery]);

  const hasMoreJobs = jobs.length < totalJobs;
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll for "All Jobs" tab
  useEffect(() => {
    if (!hasMoreJobs) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          (filters.page || 1) * (filters.size || 20) < totalJobs
        ) {
          setFilters((prev) => ({
            ...prev,
            page: (prev.page || 1) + 1,
          }));
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    const current = loadMoreTriggerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
      observer.disconnect();
    };
  }, [hasMoreJobs, isLoading, isLoadingMore, filters.page, filters.size, totalJobs]);

  const hasRecommendations = recommendedJobs.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Jobs for you</h1>
        <p className="text-gray-300 text-sm md:text-base">
          A simple space to explore recommended roles and all other openings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
        {/* Left: compact profile card */}
        <Card className="bg-slate-900/80 border border-slate-800 text-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {profileCompleteness === 100 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-sky-400" />
                )}
                <CardTitle className="text-sm text-white">Profile strength</CardTitle>
              </div>
              {!isProfileLoading && profileCompleteness !== undefined && (
                <span className="text-xs font-medium text-white">
                  {profileCompleteness}%
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-gray-300 mt-1">
              Keep this up-to-date to see better matching jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={profileCompleteness ?? 0} className="h-1.5 bg-slate-800" />
            <div className="text-xs text-gray-300 space-y-1">
              <p>
                {profileCompleteness === 100
                  ? "Your profile is complete. You can still edit it anytime."
                  : profileCompleteness && profileCompleteness >= 70
                  ? "Looks good. Add a few more details to reach 100%."
                  : "Spend 2–3 minutes to fill your profile once. It will help us show better jobs."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/profile/wizard")}
                className="mt-1 inline-flex items-center rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                {profileCompleteness === 100 ? "View / edit profile" : "Complete profile"}
              </button>
            </div>
            <div className="mt-3 border-t border-slate-800 pt-3 text-xs text-gray-300">
              <div className="flex items-center justify-between">
                <span>Saved jobs</span>
                <span className="font-semibold text-white">{savedJobsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: main jobs area with tabs */}
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "recommended" | "all")}
          >
            <TabsList className="bg-slate-900/80 text-xs">
              <TabsTrigger value="recommended">Recommended for you</TabsTrigger>
              <TabsTrigger value="all">All jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="pt-4 space-y-4">
              {isLoadingRecommended ? (
                <div className="py-10 text-center text-gray-300 text-sm">
                  Loading recommendations...
                </div>
              ) : !hasRecommendations ? (
                <div className="py-10 text-center text-gray-300 text-sm space-y-2">
                  <p>No recommended jobs yet.</p>
                  <p>Once your profile is filled, we&apos;ll start showing matches here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-300">
                    These roles are picked based on your profile and previous activity.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedJobs.map((job) => (
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
            </TabsContent>

            <TabsContent value="all" className="pt-4 space-y-6">
              {/* Search Bar */}
              <div className="max-w-2xl">
                <JobSearch
                  onSearch={handleSearch}
                  placeholder="Search jobs by title, company, or skills..."
                />
              </div>

              {/* Filters */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
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
                    setSearchQuery("");
                  }}
                />
              </div>

              {/* All Jobs Section */}
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm md:text-base font-semibold text-white">
                  {filteredJobs.length} jobs found
                </h2>
                <Select
                  value={filters.sort_by || "created_at"}
                  onValueChange={(
                    value: "created_at" | "title" | "location" | "view_count",
                  ) => {
                    setFilters({ ...filters, sort_by: value });
                  }}
                >
                  <SelectTrigger className="w-[160px] h-9 border-slate-800 bg-slate-900/80 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Latest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="view_count">Most popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Listings with infinite scroll */}
              {isLoading && (filters.page || 1) === 1 ? (
                <div className="text-center py-12 text-gray-300 text-sm">
                  Loading jobs...
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-300 text-sm">
                  No jobs found. Try adjusting your filters.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {hasMoreJobs && (
                    <div
                      ref={loadMoreTriggerRef}
                      className="flex items-center justify-center py-6 text-xs text-gray-300"
                    >
                      {isLoadingMore ? "Loading more jobs..." : "Scroll to load more jobs"}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}


