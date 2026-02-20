"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Briefcase, MapPin, Clock, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { savedJobsApi, SavedJob } from "@/lib/api/saved-jobs";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    setIsLoading(true);
    try {
      const response = await savedJobsApi.getSavedJobs();
      setSavedJobs(response.saved_jobs || []);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to load saved jobs");
      console.error("Error loading saved jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (savedJobId: string, jobId: string) => {
    setDeletingId(savedJobId);
    try {
      await savedJobsApi.removeSavedJob(savedJobId);
      setSavedJobs((prev) => prev.filter((sj) => sj.id !== savedJobId));
      toast.success("Job removed from saved");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to unsave job");
      console.error("Error unsaving job:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const formatSalary = (job: Job) => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹ ${minLakhs}L - ${maxLakhs}L`;
    }
    return "Salary not specified";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-300">Loading saved jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Bookmark className="h-8 w-8 text-white" />
            Saved Jobs
          </h1>
          <p className="text-gray-300">
            {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
          </p>
        </div>

        {/* Saved Jobs List */}
        {savedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2 text-white">No saved jobs yet</h3>
              <p className="text-gray-300 mb-4">
                Start exploring jobs and save the ones you're interested in.
              </p>
              <Button
                onClick={() => router.push("/jobs")}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
              >
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs
              .filter((savedJob) => savedJob.job !== null)
              .map((savedJob) => {
                const job = savedJob.job!;
                return (
                  <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg backdrop-blur-xl border-2 border-gray-600 bg-white/8 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {job.company_name?.charAt(0) || "J"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 text-white">{job.title}</h3>
                            <p className="text-gray-300 text-sm">{job.company_name}</p>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-300 hover:text-red-500 hover:bg-red-500/20 transition-colors duration-300"
                              disabled={deletingId === savedJob.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove saved job?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this job from your saved list? You can always save it again later.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose
                                onClick={() => handleUnsave(savedJob.id, job.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Remove
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Location & Salary */}
                      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-300">
                        {job.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div>{formatSalary(job)}</div>
                      </div>

                      {/* Employment Type */}
                      {job.employment_type && (
                        <div className="mb-3">
                          <Badge variant="outline" className="backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white">
                            {job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1)}
                          </Badge>
                        </div>
                      )}

                      {/* Skills */}
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills_required.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded text-xs backdrop-blur-xl border border-gray-600 bg-white/8 text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 3 && (
                            <span className="px-2 py-1 rounded text-xs backdrop-blur-xl border border-gray-600 bg-white/8 text-gray-300">
                              +{job.skills_required.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                        <div className="flex items-center gap-4 text-xs text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Saved {formatDistanceToNow(new Date(savedJob.saved_at), { addSuffix: true })}</span>
                          </div>
                          {job.application_count !== undefined && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{job.application_count} applicants</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleApply(job.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                          size="sm"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
    </div>
  );
}





