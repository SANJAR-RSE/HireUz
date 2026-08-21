"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { Application, ApplicationStatus, Job } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState, EmptyState, ErrorState } from "@/components/state-views";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Check, X, Eye } from "lucide-react";
import { toast } from "sonner";

type AiSummaryItem = {
  candidateName: string;
  applicationId: string;
  status: ApplicationStatus;
  experienceYears: number;
  matchedRequirements: string[];
  matchScore: number;
};

function ApplicationsReview() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<{ summary: string; items: AiSummaryItem[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        apiFetch<{ job: Job }>(`/jobs/${params.id}`, { auth: false }),
        apiFetch<{ applications: Application[] }>(`/applications/jobs/${params.id}`),
      ]);
      setJob(jobData.job);
      setApplications(appsData.applications);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Arizalarni yuklab bo'lmadi");
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    setUpdating(applicationId);
    try {
      await apiFetch(`/applications/${applicationId}/status`, { method: "PATCH", body: { status } });
      toast.success(status === "ACCEPTED" ? "Ariza qabul qilindi" : status === "REJECTED" ? "Ariza rad etildi" : "Status yangilandi");
      setApplications((prev) => prev?.map((a) => (a._id === applicationId ? { ...a, status } : a)) ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Statusni yangilashda xatolik yuz berdi");
    } finally {
      setUpdating(null);
    }
  }

  async function loadAiSummary() {
    setAiLoading(true);
    try {
      const data = await apiFetch<{ summary: string; items: AiSummaryItem[] }>(`/ai/jobs/${params.id}/summarize-applicants`);
      setAiSummary(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "AI xulosani olib bo'lmadi");
    } finally {
      setAiLoading(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!applications || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingState rows={4} />
      </div>
    );
  }

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{job.title}</h1>
      <p className="text-muted-foreground">Kelgan arizalarni ko&apos;rib chiqing va qaror qabul qiling.</p>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Barchasi ({applications.length})</TabsTrigger>
          <TabsTrigger value="PENDING">Yuborildi</TabsTrigger>
          <TabsTrigger value="REVIEWING">Ko&apos;rib chiqilmoqda</TabsTrigger>
          <TabsTrigger value="ACCEPTED">Qabul qilingan</TabsTrigger>
          <TabsTrigger value="REJECTED">Rad etilgan</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState title="Bu bo'limda ariza yo'q" />
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const candidate = typeof app.candidate === "object" ? app.candidate : null;
              const busy = updating === app._id;
              return (
                <Card key={app._id}>
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{candidate?.name || "Nomzod"}</p>
                        <p className="text-sm text-muted-foreground">{candidate?.email}</p>
                        {app.coverNote && <p className="mt-2 text-sm">{app.coverNote}</p>}
                        {app.cvUrl && (
                          <a
                            href={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}${app.cvUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-sm text-primary hover:underline"
                          >
                            CV faylini ko&apos;rish
                          </a>
                        )}
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.status === "PENDING" && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => updateStatus(app._id, "REVIEWING")}>
                          {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Eye className="mr-1 h-3.5 w-3.5" />}
                          Ko&apos;rib chiqilmoqda
                        </Button>
                      )}
                      {(app.status === "PENDING" || app.status === "REVIEWING") && (
                        <>
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => updateStatus(app._id, "ACCEPTED")}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                            Qabul qilish
                          </Button>
                          <Button size="sm" variant="destructive" disabled={busy} onClick={() => updateStatus(app._id, "REJECTED")}>
                            {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1 h-3.5 w-3.5" />}
                            Rad etish
                          </Button>
                        </>
                      )}
                    </div>
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
            <Sparkles className="h-5 w-5 text-primary" /> HireUz AI — arizalar xulosasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiSummary === null ? (
            <Button variant="outline" onClick={loadAiSummary} disabled={aiLoading}>
              {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Arizalarni ko&apos;nikma bo&apos;yicha solishtir
            </Button>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
              <div className="mt-3 space-y-2">
                {aiSummary.items.map((item) => (
                  <div key={item.applicationId} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{item.candidateName}</p>
                      <p className="text-muted-foreground">
                        {item.experienceYears} yil tajriba · Mos ko&apos;nikmalar: {item.matchedRequirements.join(", ") || "—"}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Bu faqat ko&apos;nikma moslik xulosasi — yakuniy qarorni siz qabul qilasiz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployerApplicationsPage() {
  return (
    <Protected role="employer">
      <ApplicationsReview />
    </Protected>
  );
}
