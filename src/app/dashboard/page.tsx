import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { getLinksWithCounts } from "@/lib/stats";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function Dashboard() {
  const links = await getLinksWithCounts();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const host = baseUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
        <Link
          href="/"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-emerald-400"
        >
          New link
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 px-6 py-16 text-center">
          <p className="text-neutral-400">No links yet.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-emerald-400 hover:text-emerald-300">
            Create your first short link →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 shadow-sm shadow-black/10">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Short link</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 text-right font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {links.map((link) => {
                const shortUrl = `${baseUrl}/${link.slug}`;
                return (
                  <tr key={link.slug} className="transition hover:bg-neutral-900/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${link.slug}`}
                        className="font-mono text-emerald-400 hover:text-emerald-300"
                      >
                        {host}/{link.slug}
                      </Link>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-400">
                      <a href={link.targetUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        {link.targetUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-200">
                      {link.clickCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                      {dateFormat.format(link.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CopyButton value={shortUrl} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
