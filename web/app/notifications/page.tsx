"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { apiFetch, ApiError } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { LoadingState, EmptyState, ErrorState } from "@/components/state-views";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellDot } from "lucide-react";
import { cn } from "@/lib/utils";

function NotificationsList() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ notifications: Notification[] }>("/notifications")
      .then((d) => {
        setItems(d.notifications);
        d.notifications
          .filter((n) => !n.isRead)
          .forEach((n) => apiFetch(`/notifications/${n._id}/read`, { method: "PATCH" }).catch(() => {}));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Bildirishnomalarni yuklab bo'lmadi"));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Bildirishnomalar</h1>
      <div className="mt-6">
        {error && <ErrorState message={error} />}
        {!error && items === null && <LoadingState />}
        {!error && items !== null && items.length === 0 && (
          <EmptyState title="Bildirishnomalar yo'q" description="Yangi hodisalar bo'lganda shu yerda ko'rinadi." />
        )}
        {!error && items !== null && items.length > 0 && (
          <div className="space-y-2">
            {items.map((n) => (
              <Card key={n._id} className={cn(!n.isRead && "border-primary/40 bg-primary/5")}>
                <CardContent className="flex items-start gap-3 py-3">
                  {n.isRead ? (
                    <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <BellDot className="mt-0.5 h-4 w-4 text-primary" />
                  )}
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Protected>
      <NotificationsList />
    </Protected>
  );
}
