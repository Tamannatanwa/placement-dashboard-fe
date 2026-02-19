"use client";

import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { MapPin, Bookmark, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isSaved?: boolean;
}

/**
 * Job card component displaying job information
 * Shows title, company, location, salary, type, description, skills
 */
export function JobCard({ job, onApply, onSave, isSaved = false }: JobCardProps) {
  // Format salary range
  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      const minLakhs = (job.salary_min / 100000).toFixed(1);
      const maxLakhs = (job.salary_max / 100000).toFixed(1);
      return `₹ ${minLakhs}L - ${maxLakhs}L`;
    }
    return "Salary not specified";
  };

  // Format time ago
  const timeAgo = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
    : "";

  // Get employment type display
  const getEmploymentType = () => {
    const type = job.employment_type || "";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="backdrop-blur-xl border-2 border-gray-600 rounded-2xl bg-white/8 p-6 hover:shadow-lg transition-shadow relative">
      {/* Save Button */}
      <button
        onClick={() => onSave(job.id)}
        className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors duration-300"
        aria-label={isSaved ? "Unsave job" : "Save job"}
      >
        <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current text-white" : ""}`} />
      </button>

      {/* Job Icon & Title */}
      <div className="flex items-start gap-4 mb-4">
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

      {/* Location & Salary */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-300">
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
      </div>

      {/* Employment Type Badge */}
      {job.employment_type && (
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl border-2 border-gray-600 bg-white/8 text-white">
            {getEmploymentType()}
          </span>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
          {job.description}
        </p>
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
          {timeAgo && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          )}
          {job.application_count !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.application_count} applicants</span>
            </div>
          )}
        </div>
        <Button
          onClick={() => onApply(job.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
          size="sm"
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}





