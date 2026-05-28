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
  title: "Rumik — Cognitive Memory Protocol",
  description:
    "AI memory orchestration with persistent identity, cognitive query planning, and full explainability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-screen p-4">
        {/* Master App Container — 32px radius as per spec */}
        <div
          className="h-full w-full flex overflow-hidden"
          style={{
            borderRadius: "var(--radius-app)",
            background: "var(--bg-app)",
          }}
        >
          <Sidebar />
          <main className="flex-1 min-w-0 relative overflow-hidden" style={{ borderRadius: "0 var(--radius-container) var(--radius-container) 0" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
