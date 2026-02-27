"use client";

import { useState } from "react";
import { JobFilters as JobFiltersType } from "@/types/job";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  const FilterRadioOption = ({
    label,
    value,
    groupName,
  }: {
    label: string;
    value: string;
    groupName: string;
  }) => {
    const id = `${groupName}-${value}`;
    return (
      <div className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2">
        <RadioGroupItem value={value} id={id} />
        <label
          htmlFor={id}
          className="text-sm text-foreground flex-1 cursor-pointer"
        >
          {label}
        </label>
      </div>
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
          <RadioGroup
            value={filters.employment_type ?? ""}
            onValueChange={(val) => updateFilter("employment_type", val)}
          >
            <FilterRadioOption
              label="Full Time"
              value="fulltime"
              groupName="employment_type"
            />
            <FilterRadioOption
              label="Part Time"
              value="parttime"
              groupName="employment_type"
            />
            <FilterRadioOption
              label="Contract"
              value="contract"
              groupName="employment_type"
            />
            <FilterRadioOption
              label="Internship"
              value="internship"
              groupName="employment_type"
            />
          </RadioGroup>
        </FilterSection>

        <FilterSection title="Work Type" sectionKey="workType">
          <RadioGroup
            value={filters.work_type ?? ""}
            onValueChange={(val) => updateFilter("work_type", val)}
          >
            <FilterRadioOption
              label="Remote"
              value="remote"
              groupName="work_type"
            />
            <FilterRadioOption
              label="On-Site"
              value="on-site"
              groupName="work_type"
            />
            <FilterRadioOption
              label="Hybrid"
              value="hybrid"
              groupName="work_type"
            />
          </RadioGroup>
        </FilterSection>

        <FilterSection title="Location" sectionKey="location">
          <RadioGroup
            value={filters.location ?? ""}
            onValueChange={(val) => updateFilter("location", val)}
          >
            <FilterRadioOption
              label="Remote"
              value="Remote"
              groupName="location"
            />
            <FilterRadioOption
              label="Pan India"
              value="Pan India"
              groupName="location"
            />
            <FilterRadioOption
              label="International"
              value="International"
              groupName="location"
            />
            <FilterRadioOption
              label="Bangalore"
              value="Bangalore"
              groupName="location"
            />
            <FilterRadioOption
              label="Pune"
              value="Pune"
              groupName="location"
            />
            <FilterRadioOption
              label="Mumbai"
              value="Mumbai"
              groupName="location"
            />
            <FilterRadioOption
              label="Hyderabad"
              value="Hyderabad"
              groupName="location"
            />
            <FilterRadioOption
              label="Delhi"
              value="Delhi"
              groupName="location"
            />
            <FilterRadioOption
              label="Chennai"
              value="Chennai"
              groupName="location"
            />
          </RadioGroup>
        </FilterSection>

        <FilterSection title="Experience Level" sectionKey="experience">
          <RadioGroup
            value={
              filters.is_fresher === true
                ? "fresher"
                : filters.is_fresher === false
                ? "experienced"
                : ""
            }
            onValueChange={(val) => {
              if (!val) {
                updateFilter("is_fresher", undefined);
                return;
              }
              updateFilter("is_fresher", val === "fresher");
            }}
          >
            <FilterRadioOption
              label="Fresher"
              value="fresher"
              groupName="experience"
            />
            <FilterRadioOption
              label="Experienced"
              value="experienced"
              groupName="experience"
            />
          </RadioGroup>
        </FilterSection>
      </div>
    </div>
  );
}

