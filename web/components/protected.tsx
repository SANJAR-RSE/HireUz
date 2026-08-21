"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { LoadingState } from "@/components/state-views";

export function Protected({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    }
  }, [loading, user, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <LoadingState />
      </div>
    );
  }

  return <>{children}</>;
}
