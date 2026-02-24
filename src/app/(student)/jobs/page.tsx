"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [jobsTab, setJobsTab] = useState<"recommended" | "all">("all");
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(null);
  const [noMore, setNoMore] = useState(false);

  useEffect(() => {
    loadJobs();
    loadRecommendedJobs();
    loadSavedJobs();
  }, [filters]);

  useEffect(() => {
    loadProfileCompleteness();
  }, []);

  const loadProfileCompleteness = async () => {
    try {
      const profile = await studentsApi.getMyProfile();
      if (profile.profile_completeness !== undefined) {
        setProfileCompleteness(profile.profile_completeness);
      }
    } catch {
      // Silently fail
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

      if (isFirstPage) {
        setNoMore(false);
      }
      if (!isFirstPage && response.items.length === 0) {
        setNoMore(true);
      }

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

  // Load recommended jobs from API
  const loadRecommendedJobs = async () => {
    setIsLoadingRecommended(true);
    try {
      const response = await studentsApi.getRecommendedJobs(10, 0);
      const jobs = response.recommendations.map((rec) => rec.job);
      setRecommendedJobs(jobs);
    } catch (error: any) {
      console.error("Error loading recommended jobs:", error);
      // Silently fail - recommendations are optional
    } finally {
      setIsLoadingRecommended(false);
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

  // Handle text search purely on the client side (title/company/skills_required).
  // We intentionally do NOT send this query as a backend `skills` filter,
  // because that expects exact skill names and can hide many valid jobs.
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  // Handle save job using API
  const handleSave = async (jobId: string) => {
    const isCurrentlySaved = savedJobs.has(jobId);
    if (isCurrentlySaved) {
      toast.info("To unsave, please use the saved jobs page");
      return;
    }
    setSavingJobId(jobId);
    try {
      await savedJobsApi.saveJob({
        job_id: jobId,
      });
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });
      setSavedJobsCount((prev) => prev + 1);
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save job");
    } finally {
      setSavingJobId(null);
    }
  };

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

  const pageSize = filters.size || 20;
  // Show "Load more" when: API says more exist, OR we have a full page (might be more); hide only after a load returned 0 items
  const hasMoreJobs = !noMore && (jobs.length < totalJobs || jobs.length >= pageSize);

  const loadMore = () => {
    if (!hasMoreJobs || isLoadingMore) return;
    setFilters((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  // Active filter labels for chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof JobFiltersType; label: string }[] = [];
    if (filters.employment_type) {
      const label = filters.employment_type.charAt(0).toUpperCase() + filters.employment_type.slice(1).replace(/-/g, " ");
      chips.push({ key: "employment_type", label });
    }
    if (filters.work_type) {
      const label = filters.work_type === "on-site" ? "On-Site" : filters.work_type.charAt(0).toUpperCase() + filters.work_type.slice(1);
      chips.push({ key: "work_type", label });
    }
    if (filters.location) chips.push({ key: "location", label: filters.location });
    if (filters.is_fresher === true) chips.push({ key: "is_fresher", label: "Fresher" });
    if (filters.is_fresher === false) chips.push({ key: "is_fresher", label: "Experienced" });
    return chips;
  }, [filters]);

  const clearFilter = (key: keyof JobFiltersType) => {
    setFilters((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="space-y-3">
      {/* <h1 className="text-xl font-bold">Jobs</h1> */}

      {/* Full-width profile completion banner */}
      {profileCompleteness !== null && profileCompleteness < 100 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground">Complete your profile for better matches</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add your skills, experience & preferences to unlock 3x more relevant jobs
              </p>
            </div>
          </div>
          <Link
            href="/profile/view"
            className="shrink-0 inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Sidebar (search + filters) + Main (tabs, chips, results) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Sidebar: search at top, then filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-card border rounded-lg p-3 sticky top-4 space-y-3">
            <JobSearch
              onSearch={handleSearch}
              placeholder="Title, company, or skills..."
            />
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
        </aside>

        {/* Main Content Area - tight spacing so cards start sooner */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Tabs: Recommended | All Jobs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg bg-muted p-0.5">
              <button
                type="button"
                onClick={() => setJobsTab("recommended")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  jobsTab === "recommended"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recommended
              </button>
              <button
                type="button"
                onClick={() => setJobsTab("all")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  jobsTab === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Jobs
              </button>
            </div>
            {/* Active filter chips */}
            {jobsTab === "all" &&
              activeFilterChips.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => clearFilter(key)}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 pl-3 pr-1.5 py-1 text-xs font-medium hover:bg-muted"
                >
                  {label}
                  <span aria-hidden className="text-muted-foreground hover:text-foreground">×</span>
                </button>
              ))}
          </div>

          {/* Section 1: Recommended Jobs */}
          {jobsTab === "recommended" && (
            <div className="space-y-4">
              {/* <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Recommended for You</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Jobs matched to your profile
                  </p>
                </div>
              </div> */}
              {isLoadingRecommended ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading recommendations...</div>
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No recommended jobs right now. Check All Jobs.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={handleApply}
                      onSave={handleSave}
                      isSaved={savedJobs.has(job.id)}
                      isSaving={savingJobId === job.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: All Jobs */}
          {jobsTab === "all" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">All Jobs</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredJobs.length} results
                  </p>
                </div>
                <Select
                  value={filters.sort_by || "created_at"}
                  onValueChange={(
                    value: "created_at" | "title" | "location" | "view_count"
                  ) => {
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

              {/* Job Listings with infinite scroll */}
              {isLoading && (filters.page || 1) === 1 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading jobs...</div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    No jobs found. Try adjusting your filters.
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                        onSave={handleSave}
                        isSaved={savedJobs.has(job.id)}
                        isSaving={savingJobId === job.id}
                      />
                    ))}
                  </div>
                  {hasMoreJobs && (
                    <div className="flex justify-center py-6">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? "Loading more..." : "Load more jobs"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


