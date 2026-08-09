import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { YatraProvider } from "@/context/YatraContext";

export const metadata: Metadata = {
  title: "YatraSetu • Digital Yatra Management & Financial Ledger",
  description:
    "Production-grade mobile-first web app for Kanwar & Pilgrimage Yatra groups. Manage members, fare collections, expenses, and download audited financial reports.",
  keywords: [
    "Yatra Management",
    "Pilgrimage Tour",
    "Member Ledger",
    "Fare Collection",
    "Expense Management",
    "Group Financial Ledger",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ToastProvider>
          <AuthProvider>
            <YatraProvider>{children}</YatraProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
