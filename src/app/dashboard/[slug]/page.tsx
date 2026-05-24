import Link from "next/link";
import { notFound } from "next/navigation";
import { ClicksChart } from "@/components/ClicksChart";
import { CopyButton } from "@/components/CopyButton";
import { DeleteLinkButton } from "@/components/DeleteLinkButton";
import { StatList } from "@/components/StatList";
import { countryLabel } from "@/lib/country";
import { getLinkStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function LinkAnalytics({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stats = await getLinkStats(slug);
  if (!stats) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const shortUrl = `${baseUrl}/${slug}`;
  const host = baseUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-300">
          ← All links
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xl text-emerald-400 hover:text-emerald-300"
            >
              {host}/{slug}
            </a>
            <p className="mt-1 max-w-xl truncate text-sm text-neutral-500">→ {stats.link.targetUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={shortUrl} label="Copy link" />
            <DeleteLinkButton slug={slug} redirectTo="/dashboard" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total clicks" value={stats.totalClicks.toLocaleString()} />
        <Stat label="Countries" value={String(stats.countries.length)} />
        <Stat label="Referrers" value={String(stats.referrers.length)} />
        <Stat
          label="Last 30 days"
          value={stats.byDay.reduce((sum, day) => sum + day.clicks, 0).toLocaleString()}
        />
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 shadow-sm shadow-black/10">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Clicks over time
        </h3>
        <ClicksChart data={stats.byDay} />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <StatList
          title="Top countries"
          total={stats.totalClicks}
          items={stats.countries.map((item) => ({
            key: item.label,
            label: countryLabel(item.label),
            count: item.count,
          }))}
        />
        <StatList
          title="Top referrers"
          total={stats.totalClicks}
          items={stats.referrers.map((item) => ({
            key: item.label,
            label: item.label,
            count: item.count,
          }))}
        />
        <StatList
          title="Devices"
          total={stats.totalClicks}
          items={stats.devices.map((item) => ({
            key: item.label,
            label: titleCase(item.label),
            count: item.count,
          }))}
        />
        <StatList
          title="Browsers"
          total={stats.totalClicks}
          items={stats.browsers.map((item) => ({
            key: item.label,
            label: item.label,
            count: item.count,
          }))}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
      <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
