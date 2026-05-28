import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Visionary 2.0 — Cognitive Memory Protocol",
  description: "AI interface built to the Visionary 2.0 design system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-frame">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden" style={{ borderRadius: "0 var(--radius-app) var(--radius-app) 0" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
