"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Delete button with an inline two-step confirmation. On success it either
// refreshes the current Server Component data or navigates to `redirectTo`
// (used on the per-link page, which no longer exists after deletion).
export function DeleteLinkButton({ slug, redirectTo }: { slug: string; redirectTo?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    setFailed(false);
    try {
      const response = await fetch(`/api/links/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      setFailed(true);
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="rounded-md border border-red-900 bg-red-950/40 px-3 py-1.5 text-sm text-red-300 transition hover:border-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-500 disabled:opacity-60"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition hover:border-red-800 hover:text-red-300"
    >
      {failed ? "Retry delete" : "Delete"}
    </button>
  );
}
