"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import type { Application, Job } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState, EmptyState, ErrorState } from "@/components/state-views";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

type AiRecommendation = { job: Job; matchScore: number };

function CandidateDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<AiRecommendation[] | null>(null);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ applications: Application[] }>("/applications/mine")
      .then((d) => setApplications(d.applications))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Arizalarni yuklab bo'lmadi"));
  }, []);

  async function loadRecommendations() {
    setRecsLoading(true);
    try {
      const data = await apiFetch<{ results: AiRecommendation[] }>("/ai/recommend");
      setRecs(data.results);
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Xush kelibsiz, {user?.name.split(" ")[0]}</h1>
      <p className="text-muted-foreground">Yuborgan arizalaringiz va ularning joriy holati.</p>

      <div className="mt-6">
        {error && <ErrorState message={error} />}
        {!error && applications === null && <LoadingState />}
        {!error && applications !== null && applications.length === 0 && (
          <EmptyState
            title="Hali ariza yubormadingiz"
            description="Vakansiyalar ro'yxatidan o'zingizga mos ishni toping va ariza bering."
          />
        )}
        {!error && applications !== null && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => {
              const job = typeof app.job === "object" ? app.job : null;
              return (
                <Card key={app._id}>
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{job?.title || "Vakansiya"}</p>
                      <p className="text-sm text-muted-foreground">
                        Yuborilgan: {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" /> HireUz AI tavsiyasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recs === null ? (
            <Button variant="outline" onClick={loadRecommendations} disabled={recsLoading}>
              {recsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Menga mos vakansiyalarni ko&apos;rsat
            </Button>
          ) : recs.length === 0 ? (
            <EmptyState
              title="Tavsiya topilmadi"
              description="Profilingizga ko'nikmalar qo'shsangiz, moslikni yaxshiroq baholaymiz."
            />
          ) : (
            <div className="space-y-2">
              {recs.map((r) => (
                <Link
                  key={r.job._id}
                  href={`/candidate/jobs/${r.job._id}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:border-primary/50"
                >
                  <span className="font-medium">{r.job.title}</span>
                  <span className="text-muted-foreground">{r.job.location}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CandidateDashboardPage() {
  return (
    <Protected role="candidate">
      <CandidateDashboard />
    </Protected>
  );
}
