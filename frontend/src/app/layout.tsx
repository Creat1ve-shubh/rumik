import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMP — Cognitive Memory Protocol",
  description:
    "AI memory orchestration with persistent identity, cognitive query planning, and full explainability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[1440px] h-[calc(100vh-4rem)] flex rounded-[32px] overflow-hidden glass-panel relative">
          <Sidebar />
          <main className="flex-1 min-h-full bg-white/50 backdrop-blur-md rounded-l-[32px] md:rounded-l-none md:border-l md:border-[var(--cmp-border)] shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
