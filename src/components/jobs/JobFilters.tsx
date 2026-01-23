"use client";

import { JobFilters as JobFiltersType } from "@/types/job";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClear: () => void;
}

/**
 * Filter component for job listings
 * Allows filtering by employment type, work type, location, etc.
 */
export function JobFilters({ filters, onFiltersChange, onClear }: JobFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || value === "" ? undefined : value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Employment Type */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Employment Type
          </label>
          <Select
            value={filters.employment_type || "all"}
            onValueChange={(value) => updateFilter("employment_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="fulltime">Full Time</SelectItem>
              <SelectItem value="parttime">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Work Type */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Work Type
          </label>
          <Select
            value={filters.work_type || "all"}
            onValueChange={(value) => updateFilter("work_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="on-site">On-Site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Location
          </label>
          <Select
            value={filters.location || "all"}
            onValueChange={(value) => updateFilter("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Pan India">Pan India</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Chennai">Chennai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fresher Filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">
            Experience
          </label>
          <Select
            value={
              filters.is_fresher === true
                ? "fresher"
                : filters.is_fresher === false
                ? "experienced"
                : "all"
            }
            onValueChange={(value) => {
              if (value === "fresher") {
                updateFilter("is_fresher", true);
              } else if (value === "experienced") {
                updateFilter("is_fresher", false);
              } else {
                updateFilter("is_fresher", undefined);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="experienced">Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

