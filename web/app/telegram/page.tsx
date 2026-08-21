"use client";

import { useState } from "react";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function TelegramLink() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "hire_uz_bot";

  async function generateCode() {
    setLoading(true);
    try {
      const data = await apiFetch<{ code: string }>("/auth/telegram-link-code");
      setCode(data.code);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  const deepLink = code ? `https://t.me/${botUsername}?start=${code}` : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Telegramni ulash</CardTitle>
          <CardDescription>
            {user?.role === "employer"
              ? "Yangi ariza kelganda Telegramda darhol xabar oling."
              : "Ariza holatingiz o'zgarganda Telegramda darhol xabar oling."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.telegramChatId && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Telegram allaqachon ulangan
            </div>
          )}

          {!code ? (
            <Button onClick={generateCode} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user?.telegramChatId ? "Qayta ulash kodi olish" : "Ulash kodini olish"}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Quyidagi tugma orqali botni oching — kod avtomatik yuboriladi. Yoki botga qo&apos;lda yuboring:
              </p>
              <p className="rounded-lg border bg-muted px-3 py-2 text-center font-mono text-lg tracking-widest">{code}</p>
              <Button
                className="w-full"
                render={
                  <a href={deepLink!} target="_blank" rel="noreferrer">
                    <Send className="mr-2 h-4 w-4" /> Botni ochish
                  </a>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TelegramPage() {
  return (
    <Protected>
      <TelegramLink />
    </Protected>
  );
}
