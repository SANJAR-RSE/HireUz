"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Users, Bell, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const dashboardHref = user?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard";

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">TOP VACANCY. TOP CANDIDATE.</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ish qidiruvchi va ish beruvchini
            <br className="hidden sm:block" /> bitta joyda bog&apos;laymiz
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            HireUz — vakansiya joylash, ariza berish va jarayonni oxirigacha kuzatishni bitta platformada
            birlashtiradi. Web va Telegram orqali har bir harakat natijasi darhol ma&apos;lum bo&apos;ladi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Button
                size="lg"
                render={
                  <Link href={dashboardHref}>
                    Dashboardga o&apos;tish <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              <>
                <Button size="lg" render={<Link href="/register?role=candidate">Nomzod sifatida boshlash</Link>} />
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/register?role=employer">Ish beruvchi sifatida boshlash</Link>}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Briefcase className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Vakansiya joylash</CardTitle>
              <CardDescription>Ish beruvchi bir necha daqiqada vakansiya yaratadi va arizalarni boshqaradi.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Tezkor bildirishnoma</CardTitle>
              <CardDescription>Yangi ariza va status o&apos;zgarishi haqida Web va Telegramda darhol xabar.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Ochiq jarayon</CardTitle>
              <CardDescription>Ariza holati yuborilishidan qarorgacha to&apos;liq kuzatiladi.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-6 border-primary/30 bg-primary/5">
          <CardHeader>
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="mt-2">HireUz AI</CardTitle>
            <CardDescription>
              Nomzodga mos vakansiyalarni tavsiya qiladi, ish beruvchiga arizalarni ko&apos;nikma bo&apos;yicha
              qisqacha solishtirib beradi — yakuniy qarorni doim inson qabul qiladi.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
