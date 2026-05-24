"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "./CopyButton";

interface CreatedLink {
  slug: string;
  targetUrl: string;
  shortUrl: string;
}

export function CreateLinkForm({ baseUrl }: { baseUrl: string }) {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedLink | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customSlug: customSlug.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResult({
        slug: data.slug,
        targetUrl: data.targetUrl,
        shortUrl: `${baseUrl}/${data.slug}`,
      });
      setUrl("");
      setCustomSlug("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Destination URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/a-very-long-link"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-emerald-500"
          />
        </div>

        {showAlias ? (
          <div>
            <label htmlFor="alias" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Custom alias <span className="text-neutral-500">(optional)</span>
            </label>
            <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-900 px-4 focus-within:border-emerald-500">
              <span className="text-sm text-neutral-500">{baseUrl.replace(/^https?:\/\//, "")}/</span>
              <input
                id="alias"
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                placeholder="my-link"
                className="w-full bg-transparent py-3 pl-1 text-neutral-100 outline-none placeholder:text-neutral-600"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAlias(true)}
            className="text-sm text-emerald-400 transition hover:text-emerald-300"
          >
            + Add a custom alias
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Shortening…" : "Shorten URL"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3 rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-emerald-300 hover:underline"
            >
              {result.shortUrl}
            </a>
            <CopyButton value={result.shortUrl} />
          </div>
          <p className="truncate text-sm text-neutral-400">→ {result.targetUrl}</p>
          <Link
            href={`/dashboard/${result.slug}`}
            className="inline-block text-sm text-neutral-300 underline-offset-2 hover:underline"
          >
            View analytics →
          </Link>
        </div>
      )}
    </div>
  );
}
