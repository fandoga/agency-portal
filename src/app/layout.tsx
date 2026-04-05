import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono, Inter, Jost } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AgencyNavbar from "../widgets/agency-navbar/AgencyNavbar";
import Provider from "./Provider";
import { Suspense } from "react";
import Loading from "../shared/ui/loading";

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

/** Redux/RTK на клиенте ломает статический prerender; `connection()` гарантирует динамический рендер на Vercel. */
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

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
      <body className="min-h-full flex flex-col">
        <Provider>
          <Suspense fallback={null}>
            <AgencyNavbar />
          </Suspense>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </Provider>
      </body>
    </html>
  );
}
