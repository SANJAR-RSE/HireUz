import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "HireUz — TOP VACANCY. TOP CANDIDATE.",
  description: "Ish qidiruvchi va ish beruvchini bog'lovchi platforma",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
