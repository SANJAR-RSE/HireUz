"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, LogOut, User as UserIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Notification } from "@/lib/types";

export function Navbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch<{ notifications: Notification[] }>("/notifications");
      setUnread(data.notifications.filter((n) => !n.isRead).length);
    } catch {
      // sokin — navbar badge ixtiyoriy, xato UI'ni to'xtatmasin
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    if (!user) return;
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const dashboardHref = user?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          HireUz
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "candidate" && (
                <Button variant="ghost" size="sm" render={<Link href="/candidate/jobs">Vakansiyalar</Link>} />
              )}
              <Button variant="ghost" size="sm" render={<Link href={dashboardHref}>Dashboard</Link>} />
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                render={
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full p-0 text-[10px]">
                        {unread}
                      </Badge>
                    )}
                  </Link>
                }
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserIcon className="h-4 w-4" />
                      {user.name.split(" ")[0]}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={
                      <Link href={user.role === "candidate" ? "/candidate/profile" : "/employer/profile"}>Profil</Link>
                    }
                  />
                  <DropdownMenuItem render={<Link href="/telegram">Telegramni ulash</Link>} />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Chiqish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login">Kirish</Link>} />
              <Button size="sm" render={<Link href="/register">Ro&apos;yxatdan o&apos;tish</Link>} />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
