import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { YatraProvider } from "@/context/YatraContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Trip Management • Digital Yatra Ledger",
  description:
    "Production-grade mobile-first web app for Kanwar & Pilgrimage Yatra groups. Manage members, fare collections, expenses, and download audited financial reports.",
  applicationName: "Trip Management",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trip Manager",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  keywords: [
    "Trip Management",
    "Trip Manager",
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
            <YatraProvider>
              <ServiceWorkerRegister />
              {children}
            </YatraProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

