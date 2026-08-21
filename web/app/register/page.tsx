"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Building2 } from "lucide-react";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "candidate";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name, email, password, role, companyName: role === "employer" ? companyName : undefined });
      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      router.push(user.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Ro&apos;yxatdan o&apos;tish</CardTitle>
          <CardDescription>Rolingizni tanlang va hisob yarating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                role === "candidate" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"
              )}
            >
              <UserIcon className="h-5 w-5" />
              Nomzod
            </button>
            <button
              type="button"
              onClick={() => setRole("employer")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                role === "employer" ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"
              )}
            >
              <Building2 className="h-5 w-5" />
              Ish beruvchi
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{role === "employer" ? "Sizning ismingiz" : "To'liq ism"}</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism Familiya" />
            </div>
            {role === "employer" && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Kompaniya nomi</Label>
                <Input id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Kompaniya MChJ" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kamida 6 belgi" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Kiring
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
