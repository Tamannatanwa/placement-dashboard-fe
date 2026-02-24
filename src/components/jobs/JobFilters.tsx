"use client";

import { useState } from "react";
import { JobFilters as JobFiltersType } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClear: () => void;
}

/**
 * Coursera-style sidebar filter component for job listings
 * Allows filtering by employment type, work type, location, etc.
 */
export function JobFilters({ filters, onFiltersChange, onClear }: JobFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    employmentType: true,
    workType: true,
    location: true,
    experience: true,
  });

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || value === "" ? undefined : value,
    });
  };

  const toggleCheckboxFilter = (key: keyof JobFiltersType, value: string) => {
    const currentValue = filters[key];
    if (currentValue === value) {
      updateFilter(key, undefined);
    } else {
      updateFilter(key, value);
    }
  };

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h3 className="font-semibold text-sm">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && <div className="space-y-2">{children}</div>}
      </div>
    );
  };

  const FilterCheckbox = ({
    label,
    value,
    checked,
    onChange,
  }: {
    label: string;
    value: string;
    checked: boolean;
    onChange: () => void;
  }) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2">
        <Checkbox checked={checked} onCheckedChange={onChange} />
        <span className="text-sm text-foreground flex-1">{label}</span>
      </label>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-base">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs h-auto p-0 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <FilterSection title="Employment Type" sectionKey="employmentType">
          <FilterCheckbox
            label="Full Time"
            value="fulltime"
            checked={filters.employment_type === "fulltime"}
            onChange={() => toggleCheckboxFilter("employment_type", "fulltime")}
          />
          <FilterCheckbox
            label="Part Time"
            value="parttime"
            checked={filters.employment_type === "parttime"}
            onChange={() => toggleCheckboxFilter("employment_type", "parttime")}
          />
          <FilterCheckbox
            label="Contract"
            value="contract"
            checked={filters.employment_type === "contract"}
            onChange={() => toggleCheckboxFilter("employment_type", "contract")}
          />
          <FilterCheckbox
            label="Internship"
            value="internship"
            checked={filters.employment_type === "internship"}
            onChange={() => toggleCheckboxFilter("employment_type", "internship")}
          />
        </FilterSection>

        <FilterSection title="Work Type" sectionKey="workType">
          <FilterCheckbox
            label="Remote"
            value="remote"
            checked={filters.work_type === "remote"}
            onChange={() => toggleCheckboxFilter("work_type", "remote")}
          />
          <FilterCheckbox
            label="On-Site"
            value="on-site"
            checked={filters.work_type === "on-site"}
            onChange={() => toggleCheckboxFilter("work_type", "on-site")}
          />
          <FilterCheckbox
            label="Hybrid"
            value="hybrid"
            checked={filters.work_type === "hybrid"}
            onChange={() => toggleCheckboxFilter("work_type", "hybrid")}
          />
        </FilterSection>

        <FilterSection title="Location" sectionKey="location">
          <FilterCheckbox
            label="Remote"
            value="Remote"
            checked={filters.location === "Remote"}
            onChange={() => toggleCheckboxFilter("location", "Remote")}
          />
          <FilterCheckbox
            label="Pan India"
            value="Pan India"
            checked={filters.location === "Pan India"}
            onChange={() => toggleCheckboxFilter("location", "Pan India")}
          />
          <FilterCheckbox
            label="International"
            value="International"
            checked={filters.location === "International"}
            onChange={() => toggleCheckboxFilter("location", "International")}
          />
          <FilterCheckbox
            label="Bangalore"
            value="Bangalore"
            checked={filters.location === "Bangalore"}
            onChange={() => toggleCheckboxFilter("location", "Bangalore")}
          />
          <FilterCheckbox
            label="Pune"
            value="Pune"
            checked={filters.location === "Pune"}
            onChange={() => toggleCheckboxFilter("location", "Pune")}
          />
          <FilterCheckbox
            label="Mumbai"
            value="Mumbai"
            checked={filters.location === "Mumbai"}
            onChange={() => toggleCheckboxFilter("location", "Mumbai")}
          />
          <FilterCheckbox
            label="Hyderabad"
            value="Hyderabad"
            checked={filters.location === "Hyderabad"}
            onChange={() => toggleCheckboxFilter("location", "Hyderabad")}
          />
          <FilterCheckbox
            label="Delhi"
            value="Delhi"
            checked={filters.location === "Delhi"}
            onChange={() => toggleCheckboxFilter("location", "Delhi")}
          />
          <FilterCheckbox
            label="Chennai"
            value="Chennai"
            checked={filters.location === "Chennai"}
            onChange={() => toggleCheckboxFilter("location", "Chennai")}
          />
        </FilterSection>

        <FilterSection title="Experience Level" sectionKey="experience">
          <FilterCheckbox
            label="Fresher"
            value="fresher"
            checked={filters.is_fresher === true}
            onChange={() => {
              if (filters.is_fresher === true) {
                updateFilter("is_fresher", undefined);
              } else {
                updateFilter("is_fresher", true);
              }
            }}
          />
          <FilterCheckbox
            label="Experienced"
            value="experienced"
            checked={filters.is_fresher === false}
            onChange={() => {
              if (filters.is_fresher === false) {
                updateFilter("is_fresher", undefined);
              } else {
                updateFilter("is_fresher", false);
              }
            }}
          />
        </FilterSection>
      </div>
    </div>
  );
}

