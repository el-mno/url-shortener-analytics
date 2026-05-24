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
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500 text-neutral-950">
                ↗
              </span>
              Trim
            </Link>
            <nav className="flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/" className="transition hover:text-neutral-100">
                Create
              </Link>
              <Link href="/dashboard" className="transition hover:text-neutral-100">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
