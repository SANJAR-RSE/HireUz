"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, ApiError } from "./api";
import type { Role, User } from "./types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: Role; companyName?: string }) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hireuz_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch((err) => {
        // Faqat token haqiqatan yaroqsiz bo'lsa (401) chiqarib yuboramiz —
        // vaqtinchalik tarmoq xatosi yoki backend cold-start sababli
        // foydalanuvchini sessiyadan chiqarib qo'ymaslik kerak.
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem("hireuz_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    localStorage.setItem("hireuz_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload: { name: string; email: string; password: string; role: Role; companyName?: string }) {
    const data = await apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
    localStorage.setItem("hireuz_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("hireuz_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}

export { ApiError };
