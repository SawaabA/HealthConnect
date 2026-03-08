import type { Metadata } from "next";
import Link from "next/link";
import { Source_Serif_4, Space_Grotesk } from "next/font/google";

import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700"]
});

const bodyFont = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "HealthConnect",
  description: "Patient-controlled healthcare consent and access layer"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} min-h-screen bg-slate-50 text-slate-900`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <header className="mb-8 rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="text-2xl font-bold tracking-tight text-sky-700 [font-family:var(--font-heading)]">
                HealthConnect
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <Link href="/patient" className="hover:text-sky-700">
                  Patient
                </Link>
                <Link href="/doctor" className="hover:text-sky-700">
                  Doctor
                </Link>
                <Link href="/guardian" className="hover:text-sky-700">
                  Guardian
                </Link>
                <Link href="/admin" className="hover:text-sky-700">
                  Admin
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
