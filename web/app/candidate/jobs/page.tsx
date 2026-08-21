"use client";

import { useEffect, useState, useCallback } from "react";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { Job, Category } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { LoadingState, EmptyState, ErrorState } from "@/components/state-views";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

function JobsBrowser() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (location) params.set("location", location);
      if (category !== "all") params.set("category", category);
      const data = await apiFetch<{ jobs: Job[] }>(`/jobs?${params.toString()}`, { auth: false });
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Vakansiyalarni yuklab bo'lmadi");
    }
  }, [search, location, category]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/categories", { auth: false })
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Vakansiyalar</h1>
      <p className="text-muted-foreground">Sizga mos vakansiyani toping va ariza bering.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Lavozim bo'yicha qidirish..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input placeholder="Joylashuv" className="max-w-[160px]" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Kategoriya">
              {(v: string | null) => (v === "all" || !v ? "Barcha kategoriyalar" : categories.find((c) => c._id === v)?.name)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {error && <ErrorState message={error} />}
        {!error && jobs === null && <LoadingState />}
        {!error && jobs !== null && jobs.length === 0 && (
          <EmptyState title="Vakansiya topilmadi" description="Qidiruv shartlarini o'zgartirib ko'ring." />
        )}
        {!error && jobs !== null && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} href={`/candidate/jobs/${job._id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateJobsPage() {
  return (
    <Protected role="candidate">
      <JobsBrowser />
    </Protected>
  );
}
