import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trim — short links with analytics",
  description:
    "A URL shortener with built-in click analytics: traffic over time, geography, referrers, and devices.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="min-h-screen text-neutral-100 antialiased">
        <header className="sticky top-0 z-20 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 font-bold text-neutral-950 shadow-sm shadow-emerald-500/30 transition group-hover:bg-emerald-400">
                ↗
              </span>
              Trim
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-100"
              >
                Create
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-100"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
