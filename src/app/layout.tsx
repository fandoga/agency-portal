import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "./AppShell";
import { cn } from "@/lib/utils";
import AgencyNavbar from "../widgets/agency-navbar/AgencyNavbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Jost, Geologica,

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "testname - Agency Portal",
  description: "testdescription - agency portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <AppShell>
        <body className="min-h-full flex flex-col">
          <AgencyNavbar />
          {children}
        </body>
      </AppShell>
    </html>
  );
}
