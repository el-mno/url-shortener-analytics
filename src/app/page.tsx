import { CreateLinkForm } from "@/components/CreateLinkForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ notfound?: string }>;
}) {
  const { notfound } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Shorten links. <span className="text-emerald-400">Watch the clicks.</span>
        </h1>
        <p className="mx-auto max-w-md text-neutral-400">
          Create a short link and get instant analytics — traffic over time, countries, referrers,
          and devices.
        </p>
      </div>

      {notfound && (
        <p className="mb-6 rounded-lg border border-amber-900 bg-amber-950/30 px-4 py-3 text-center text-sm text-amber-300">
          No link found for <span className="font-mono">/{notfound}</span>.
        </p>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-xl shadow-black/20">
        <CreateLinkForm baseUrl={baseUrl} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-neutral-500">
        <Feature label="Custom aliases" />
        <Feature label="Live analytics" />
        <Feature label="No IPs stored" />
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/30 px-3 py-2.5">
      {label}
    </div>
  );
}
