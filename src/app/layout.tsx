import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRD Architect — Autonomous AI Product Discovery & Command Center",
  description: "Transform vague ideas into detailed, implementation-ready Product Requirements Documents through continuous adaptive AI discovery and visual knowledge graphs.",
  keywords: ["PRD", "AI Product Manager", "Knowledge Graph", "Product Discovery", "Requirements Engineering"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-tech-grid bg-[#060813] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
