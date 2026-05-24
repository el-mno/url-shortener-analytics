import type { ReactNode } from "react";

export interface StatRow {
  key: string;
  label: ReactNode;
  count: number;
}

// A ranked horizontal-bar breakdown (countries, referrers, devices, browsers).
// Bar width is relative to the top item; the percentage is share of total.
export function StatList({
  title,
  items,
  total,
  emptyLabel = "No data yet",
}: {
  title: string;
  items: StatRow[];
  total: number;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-600">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {items.slice(0, 8).map((item) => {
            const share = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <li key={item.key}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-neutral-200">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-neutral-500">
                    {item.count} · {share}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-emerald-500/70"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
