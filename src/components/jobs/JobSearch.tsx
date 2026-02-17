"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface JobSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

/**
 * Search component for jobs
 * Allows searching by title, company, or skills
 */
export function JobSearch({ onSearch, placeholder }: JobSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Trigger debounced search as the user types for a smoother UX.
  // Important: depend only on searchQuery to avoid infinite loops when parent recreates onSearch.
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || "Search jobs by title, company, or skills..."}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="pl-10 h-12 text-base"
        />
      </div>
    </form>
  );
}


