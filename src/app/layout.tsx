import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Jost } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AgencyNavbar from "../widgets/agency-navbar/AgencyNavbar";
import Provider from "./Provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const jost = Jost({
  variable: "--font-jost",
  subsets: ["cyrillic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
        jost.variable,
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <Provider>
        <body className="min-h-full flex flex-col">
          <AgencyNavbar />
          {children}
        </body>
      </Provider>
    </html>
  );
}
