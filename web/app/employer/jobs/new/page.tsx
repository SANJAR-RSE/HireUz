"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EMPLOYMENT_LABEL: Record<string, string> = {
  "full-time": "To'liq stavka",
  "part-time": "Yarim stavka",
  remote: "Masofaviy",
  internship: "Amaliyot",
  contract: "Shartnoma",
};

function NewJobForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/categories", { auth: false })
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Sarlavha va tavsif majburiy");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ job: { _id: string } }>("/jobs", {
        method: "POST",
        body: {
          title,
          description,
          requirements,
          location,
          employmentType,
          category: category || undefined,
          salaryMin: salaryMin ? Number(salaryMin) : undefined,
          salaryMax: salaryMax ? Number(salaryMax) : undefined,
        },
      });
      toast.success("Vakansiya yaratildi");
      router.push(`/employer/jobs/${data.job._id}/applications`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Vakansiya yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Yangi vakansiya</CardTitle>
          <CardDescription>Vakansiya ma&apos;lumotlarini to&apos;ldiring — darhol nomzodlarga ko&apos;rinadi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Lavozim nomi</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea id="description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Lavozim haqida qisqacha ma'lumot..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Talablar (vergul bilan ajrating)</Label>
              <Textarea id="requirements" rows={2} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="React, JavaScript, CSS" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Joylashuv</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Toshkent" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Ish turi</Label>
                <Select value={employmentType} onValueChange={(v) => setEmploymentType(v ?? "full-time")}>
                  <SelectTrigger id="employmentType">
                    <SelectValue>{(v: string | null) => EMPLOYMENT_LABEL[v || "full-time"]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">To&apos;liq stavka</SelectItem>
                    <SelectItem value="part-time">Yarim stavka</SelectItem>
                    <SelectItem value="remote">Masofaviy</SelectItem>
                    <SelectItem value="internship">Amaliyot</SelectItem>
                    <SelectItem value="contract">Shartnoma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Maosh (min, so&apos;m)</Label>
                <Input id="salaryMin" type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maosh (max, so&apos;m)</Label>
                <Input id="salaryMax" type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategoriya</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Tanlang (ixtiyoriy)">
                    {(v: string | null) => (v ? categories.find((c) => c._id === v)?.name : "Tanlang (ixtiyoriy)")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vakansiyani joylash
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Protected role="employer">
      <NewJobForm />
    </Protected>
  );
}
