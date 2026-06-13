import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LEVI — Hippo Float Brand AI",
  description: "AI Creative System for Hippo Float — Drift-Free Float Collection",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, "font-sans min-h-screen bg-background")}>
        {children}
      </body>
    </html>
  );
}
