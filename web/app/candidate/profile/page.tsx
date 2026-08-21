"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { CandidateProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingState, ErrorState } from "@/components/state-views";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function CandidateProfileForm() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [bio, setBio] = useState("");

  useEffect(() => {
    apiFetch<{ profile: CandidateProfile | null }>("/profiles/me")
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setSkillsInput((d.profile.skills || []).join(", "));
          setExperienceYears(d.profile.experienceYears || 0);
          setBio(d.profile.bio || "");
        } else {
          setProfile({ user: "", skills: [], experienceYears: 0, bio: "", cvUrl: null });
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Profilni yuklab bo'lmadi"));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      await apiFetch("/profiles/me", { method: "PUT", body: { skills, experienceYears, bio } });
      toast.success("Profil saqlandi");
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

  if (!profile) {
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
          <CardTitle>Nomzod profili</CardTitle>
          <CardDescription>Ko&apos;nikmalaringiz ariza berishda va AI tavsiyasida ishlatiladi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Ko&apos;nikmalar (vergul bilan ajrating)</Label>
              <Input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Node.js, Figma" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp">Tajriba (yil)</Label>
              <Input
                id="exp"
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">O&apos;zingiz haqingizda</Label>
              <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Qisqacha tajribangiz haqida yozing..." />
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

export default function CandidateProfilePage() {
  return (
    <Protected role="candidate">
      <CandidateProfileForm />
    </Protected>
  );
}
