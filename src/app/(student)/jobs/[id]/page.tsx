"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Users, ExternalLink, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobsApi } from "@/lib/api/jobs";
import { studentsApi } from "@/lib/api/students";
import { savedJobsApi } from "@/lib/api/saved-jobs";
import { Job } from "@/types/job";
import { JobCard } from "@/components/jobs/JobCard";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

/**
 * Job Detail Page
 * Shows full job information and allows application
 */
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const viewStartTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
      checkIfSaved();
      trackJobView();
      loadSimilarJobs();
      loadSavedJobs();
    }

    // Track view duration when component unmounts
    return () => {
      if (hasTrackedView.current && jobId) {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        const jobIdNum = parseInt(jobId, 10);
        if (!isNaN(jobIdNum) && duration > 0) {
          // Track final view duration (fire and forget)
          studentsApi.trackJobView(String(jobIdNum), {
            job_id: String(jobIdNum),
            duration_seconds: duration,
            source: "job_detail",
          }).catch((error) => {
            console.error("Error tracking final job view:", error);
          });
        }
      }
    };
  }, [jobId]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const data = await jobsApi.getJob(jobId);
      setJob(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load job details");
      console.error("Error loading job:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await savedJobsApi.checkIfSaved(jobId);
      setIsSaved(response.is_saved || false);
    } catch (error: any) {
      console.error("Error checking if job is saved:", error);
      // Silently fail - default to not saved
      setIsSaved(false);
    }
  };

  const trackJobView = async () => {
    if (hasTrackedView.current) return;
    
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    try {
      await studentsApi.trackJobView(String(jobIdNum), {
        job_id: String(jobIdNum),
        duration_seconds: 0, // Initial view, duration tracked on unmount
        source: "job_detail",
      });
      hasTrackedView.current = true;
    } catch (error) {
      // Silently fail - view tracking is not critical
      console.error("Error tracking job view:", error);
    }
  };


  const loadSimilarJobs = async () => {
    const jobIdNum = parseInt(jobId, 10);
    if (isNaN(jobIdNum)) return;

    setIsLoadingSimilar(true);
    try {
      const response = await studentsApi.getSimilarJobs(String(jobIdNum));
      if (response.jobs) {
        setSimilarJobs(response.jobs);
      }
    } catch (error: any) {
      console.error("Error loading similar jobs:", error);
      // Silently fail - similar jobs are optional
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await savedJobsApi.getSavedJobs();
      const savedJobIds = new Set(response.saved_jobs.map((sj) => String(sj.job_id)));
      setSavedJobs(savedJobIds);
    } catch (error: any) {
      console.error("Error loading saved jobs:", error);
    }
  };

  // Clean up common garbage characters around apply links so they don't break
  // e.g. `"https://example.com/**"` -> `https://example.com/`
  const sanitizeApplyLink = (raw?: string | null): string | null => {
    if (!raw) return null;

    let url = raw.trim();
    if (!url) return null;

    // Strip obvious wrapping characters at the very start/end
    url = url.replace(/^["'`]+/, "").replace(/["'`]+$/, "");

    // Remove leading/trailing asterisks
    url = url.replace(/^\*+/, "").replace(/\*+$/, "");

    // Collapse trailing '/**', '/*', etc. down to a single '/'
    url = url.replace(/\/\*+$/, "/");

    return url || null;
  };

  const handleApply = (jobId?: string) => {
    const targetJob = jobId ? similarJobs.find((j) => j.id === jobId) : job;
    const sanitized = sanitizeApplyLink(targetJob?.source_url);

    if (sanitized) {
      window.open(sanitized, "_blank");
    } else {
      toast.info("Application link not available");
    }
  };

  const handleSave = async (targetJobId?: string) => {
    const jobIdToSave = targetJobId || jobId;

    try {
      const isCurrentlySaved = savedJobs.has(jobIdToSave);
      
      if (isCurrentlySaved) {
        toast.info("To unsave, please use the saved jobs page");
        return;
      }

      await savedJobsApi.saveJob({
        job_id: jobIdToSave,
      });

      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobIdToSave);
        return newSet;
      });
      
      if (jobIdToSave === jobId) {
        setIsSaved(true);
      }
      
      toast.success("Job saved successfully");
    } catch (error: any) {
      console.error("Error saving job:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save job");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-300">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-gray-300">Job not found</div>
          <Button onClick={() => router.back()} className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300">Go Back</Button>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹ ${minLakhs}L - ${maxLakhs}L`;
    }
    return "Salary not specified";
  };

  const getEmploymentType = () => {
    const type = job.employment_type || "";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const sanitizedSourceUrl = sanitizeApplyLink(job.source_url);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-300 hover:text-white hover:bg-[#282142] transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">{job.title}</h1>
              <p className="text-xl text-gray-300 mb-4">{job.company_name}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span>₹</span>
                  <span>{formatSalary()}</span>
                </div>
                {job.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                )}
                {job.application_count !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{job.application_count} applicants</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {job.employment_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white">
                    {getEmploymentType()}
                  </span>
                )}
                {job.work_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white">
                    {job.work_type}
                  </span>
                )}
                {job.is_fresher && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white">
                    Fresher Friendly
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSave()}
                className={`backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-gray-300 hover:text-white hover:bg-[#282142] transition-colors duration-300 ${isSaved ? "text-white" : ""}`}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleApply()}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
              size="lg"
            >
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            {sanitizedSourceUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(sanitizedSourceUrl, "_blank")}
                size="lg"
                className="backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white hover:bg-[#282142] transition-colors duration-300"
              >
                View Original Posting
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-6">
          {/* Description */}
          {job.description && (
            <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Job Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-300">{job.description}</p>
              </div>
            </div>
          )}

          {/* Skills Required */}
          {job.skills_required && job.skills_required.length > 0 && (
            <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-md backdrop-blur-xl border border-gray-600 bg-white/8 text-gray-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience & Salary Details */}
          <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.experience_min !== undefined && job.experience_max !== undefined && (
                <div>
                  <div className="text-sm text-gray-300 mb-1">Experience Required</div>
                  <div className="font-medium text-white">
                    {job.experience_min} - {job.experience_max} years
                  </div>
                </div>
              )}
              {job.salary_min && job.salary_max && (
                <div>
                  <div className="text-sm text-gray-300 mb-1">Salary Range</div>
                  <div className="font-medium text-white">{formatSalary()}</div>
                </div>
              )}
              {job.location && (
                <div>
                  <div className="text-sm text-gray-300 mb-1">Location</div>
                  <div className="font-medium text-white">{job.location}</div>
                </div>
              )}
              {job.employment_type && (
                <div>
                  <div className="text-sm text-gray-300 mb-1">Employment Type</div>
                  <div className="font-medium text-white">{getEmploymentType()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          {job.company && (
            <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">About Company</h2>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-300 mb-1">Company Name</div>
                  <div className="font-medium text-white">{job.company.name}</div>
                </div>
                {job.company.domain && (
                  <div>
                    <div className="text-sm text-gray-300 mb-1">Domain</div>
                    <div className="font-medium text-white">{job.company.domain}</div>
                  </div>
                )}
                {job.company.website && (
                  <div>
                    <div className="text-sm text-gray-300 mb-1">Website</div>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Similar Jobs</h2>
              {isLoadingSimilar ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">Loading similar jobs...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarJobs.slice(0, 4).map((similarJob) => (
                    <JobCard
                      key={similarJob.id}
                      job={similarJob}
                      onApply={() => handleApply(similarJob.id)}
                      onSave={() => handleSave(similarJob.id)}
                      isSaved={savedJobs.has(similarJob.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}


