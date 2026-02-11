"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { JobSearch } from "@/components/jobs/JobSearch";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { jobsApi } from "@/lib/api/jobs";
import { Job, JobFilters as JobFiltersType } from "@/types/job";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobsPage() {
  const router = useRouter();
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

  useEffect(() => {
    loadJobs();
  }, [filters]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const skills = query
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skills.length > 0) {
        setFilters({
          ...filters,
          skills: skills.join(","),
          page: 1,
        });
      }
    } else {
      const { skills, ...restFilters } = filters;
      setFilters({ ...restFilters, page: 1 });
    }
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
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

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Jobs</h1>
        <p className="text-muted-foreground text-lg">
          Browse all opportunities and apply directly.
        </p>
      </div>

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
            setSearchQuery("");
          }}
        />
      </div>

      {/* All Jobs Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredJobs.length} Jobs Found
        </h2>
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

      {/* Job Listings */}
      {isLoading ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onSave={() => {}}
              isSaved={false}
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
            onClick={() =>
              setFilters({ ...filters, page: (filters.page || 1) - 1 })
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1} of{" "}
            {Math.ceil(totalJobs / (filters.size || 20))}
          </span>
          <Button
            variant="outline"
            disabled={
              (filters.page || 1) >=
              Math.ceil(totalJobs / (filters.size || 20))
            }
            onClick={() =>
              setFilters({ ...filters, page: (filters.page || 1) + 1 })
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

