"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { Job } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/state-views";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wallet, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EMPLOYMENT_LABEL: Record<Job["employmentType"], string> = {
  "full-time": "To'liq stavka",
  "part-time": "Yarim stavka",
  remote: "Masofaviy",
  internship: "Amaliyot",
  contract: "Shartnoma",
};

function JobDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    apiFetch<{ job: Job }>(`/jobs/${params.id}`, { auth: false })
      .then((d) => setJob(d.job))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Vakansiyani yuklab bo'lmadi"));
  }, [params.id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    try {
      const form = new FormData();
      form.append("coverNote", coverNote);
      if (file) form.append("cv", file);
      await apiFetch(`/applications/jobs/${params.id}/apply`, { method: "POST", body: form, isForm: true });
      setApplied(true);
      toast.success("Arizangiz muvaffaqiyatli yuborildi!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ariza yuborishda xatolik yuz berdi");
    } finally {
      setApplying(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <LoadingState rows={4} />
      </div>
    );
  }

  const employerName = typeof job.employer === "object" ? job.employer.name : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              {employerName && <p className="mt-1 text-muted-foreground">{employerName}</p>}
            </div>
            {job.category && <Badge variant="secondary">{job.category.name}</Badge>}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> {EMPLOYMENT_LABEL[job.employmentType]}
            </span>
            {(job.salaryMin || job.salaryMax) && (
              <span className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                {job.salaryMin && job.salaryMax
                  ? `${(job.salaryMin / 1000000).toFixed(1)} – ${(job.salaryMax / 1000000).toFixed(1)} mln so'm`
                  : `${((job.salaryMin || job.salaryMax)! / 1000000).toFixed(1)} mln so'm`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Tavsif</h3>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <h3 className="mb-1 font-medium">Talablar</h3>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{job.requirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Ariza berish</CardTitle>
        </CardHeader>
        <CardContent>
          {applied ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Arizangiz yuborildi</p>
                <button onClick={() => router.push("/candidate/dashboard")} className="text-sm underline">
                  Dashboardda holatini kuzating
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverNote">Qisqa xabar (ixtiyoriy)</Label>
                <Textarea
                  id="coverNote"
                  placeholder="Nega aynan siz bu lavozimga mos kelishingizni qisqacha yozing..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv">CV (PDF/DOC, ixtiyoriy)</Label>
                <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" disabled={applying}>
                {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ariza yuborish
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Protected role="candidate">
      <JobDetail />
    </Protected>
  );
}
