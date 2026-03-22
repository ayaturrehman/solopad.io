import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/**
 * KPI stat card — built on top of the shared Card component.
 *
 * Props:
 *   label   — metric name (e.g. "Revenue")
 *   value   — metric value (e.g. "£4,800")
 *   note    — optional supporting text
 *   color   — Tailwind text color class for the value
 *   delay   — animation delay in ms
 */
export function StatCard({ label, value, note, color, delay = 0 }) {
  return (
    <Card
      interactive
      className="dash-fade-up px-4 py-4"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p
        className={cn("dash-count mt-2 text-2xl md:text-3xl tracking-tight", color || "text-zinc-900")}
        style={delay ? { animationDelay: `${delay + 80}ms` } : undefined}
      >
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-zinc-400">{note}</p>}
    </Card>
  );
}

/**
 * Grid wrapper for StatCard items.
 */
export function StatCardGrid({ children, className }) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

/**
 * Reusable recent items list — built on top of the shared Card component.
 *
 * Props:
 *   title      — section heading
 *   href       — "View all" link
 *   linkLabel  — link text (default "View all")
 *   items      — data array
 *   renderItem — (item) => JSX for each row
 *   emptyText  — shown when items is empty
 *   delay      — animation delay
 *   maxItems   — max items to show (default 6)
 */
export function RecentList({ title, href, linkLabel = "View all", items, renderItem, emptyText, delay = 0, maxItems = 6 }) {
  return (
    <Card
      className="dash-fade-up px-4 py-4"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">{title}</h2>
        {href && (
          <a href={href} className="text-xs text-zinc-400 hover:text-zinc-700">{linkLabel}</a>
        )}
      </div>
      {(!items || items.length === 0) ? (
        <p className="text-sm text-zinc-400">{emptyText || `No ${title.toLowerCase()} yet.`}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, maxItems).map((item, i) => (
            <div
              key={item.id || i}
              className="dash-fade-in flex items-center justify-between rounded bg-zinc-50 px-3 py-2"
              style={delay ? { animationDelay: `${delay + 40 + i * 40}ms` } : undefined}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
