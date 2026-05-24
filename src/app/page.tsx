import { CreateLinkForm } from "@/components/CreateLinkForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ notfound?: string }>;
}) {
  const { notfound } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Shorten links. Watch the clicks.</h1>
        <p className="text-neutral-400">
          Create a short link and get instant analytics — traffic over time, countries, referrers,
          and devices.
        </p>
      </div>

      {notfound && (
        <p className="rounded-lg border border-amber-900 bg-amber-950/30 px-4 py-3 text-center text-sm text-amber-300">
          No link found for <span className="font-mono">/{notfound}</span>.
        </p>
      )}

      <CreateLinkForm baseUrl={baseUrl} />
    </div>
  );
}
