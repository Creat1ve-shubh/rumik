import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className="h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
