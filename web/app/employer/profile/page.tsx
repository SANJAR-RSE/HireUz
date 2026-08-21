"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { CompanyProfile, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, ErrorState } from "@/components/state-views";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function EmployerProfileForm() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/categories", { auth: false })
      .then((d) => setCategories(d.categories))
      .catch(() => {});

    apiFetch<{ profile: CompanyProfile | null }>("/profiles/me")
      .then((d) => {
        if (d.profile) {
          setCompanyName(d.profile.companyName || "");
          setAbout(d.profile.about || "");
          setWebsite(d.profile.website || "");
          setCategory(d.profile.category?._id || "");
        }
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Profilni yuklab bo'lmadi"));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/profiles/me", { method: "PUT", body: { companyName, about, website, category: category || undefined } });
      toast.success("Kompaniya profili saqlandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <LoadingState rows={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Kompaniya profili</CardTitle>
          <CardDescription>Bu ma&apos;lumot nomzodlarga vakansiya sahifasida ko&apos;rinadi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Kompaniya nomi</Label>
              <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Faoliyat sohasi</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Tanlang">
                    {(v: string | null) => (v ? categories.find((c) => c._id === v)?.name : "Tanlang")}
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
            <div className="space-y-2">
              <Label htmlFor="website">Veb-sayt</Label>
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">Kompaniya haqida</Label>
              <Textarea id="about" rows={4} value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployerProfilePage() {
  return (
    <Protected role="employer">
      <EmployerProfileForm />
    </Protected>
  );
}
