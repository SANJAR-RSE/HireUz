"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { Job } from "@/lib/types";
import { LoadingState, EmptyState, ErrorState } from "@/components/state-views";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ jobs: Job[] }>("/jobs/mine")
      .then((d) => setJobs(d.jobs))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Vakansiyalarni yuklab bo'lmadi"));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Xush kelibsiz, {user?.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Joylagan vakansiyalaringiz va kelgan arizalar.</p>
        </div>
        <Button
          render={
            <Link href="/employer/jobs/new">
              <Plus className="mr-1 h-4 w-4" /> Yangi vakansiya
            </Link>
          }
        />
      </div>

      <div className="mt-6">
        {error && <ErrorState message={error} />}
        {!error && jobs === null && <LoadingState />}
        {!error && jobs !== null && jobs.length === 0 && (
          <EmptyState title="Hali vakansiya joylamadingiz" description="Birinchi vakansiyangizni yarating va nomzodlar bilan bog'laning." />
        )}
        {!error && jobs !== null && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link key={job._id} href={`/employer/jobs/${job._id}/applications`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.location || "Joylashuv ko'rsatilmagan"}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job.applicationCount ?? 0} ariza
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerDashboardPage() {
  return (
    <Protected role="employer">
      <EmployerDashboard />
    </Protected>
  );
}
