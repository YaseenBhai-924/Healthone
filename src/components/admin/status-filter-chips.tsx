import Link from "next/link";
import {
  CheckCircle2,
  CircleDot,
  ClipboardList,
  PackageCheck,
  Timer,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { QUEUE_FILTERS } from "@/lib/admin/request-labels";

type CardTone = {
  icon: LucideIcon;
  accent: string;
  iconWrap: string;
  iconColor: string;
  spark: string;
  sparkFill: string;
};

const TONES: Record<string, CardTone> = {
  all: {
    icon: ClipboardList,
    accent: "bg-brand-600",
    iconWrap: "bg-brand-50",
    iconColor: "text-brand-700",
    spark: "stroke-brand-600",
    sparkFill: "fill-brand-600/10",
  },
  Submitted: {
    icon: CircleDot,
    accent: "bg-info-fg",
    iconWrap: "bg-info-subtle",
    iconColor: "text-info-fg",
    spark: "stroke-info-fg",
    sparkFill: "fill-info-fg/10",
  },
  InProgress: {
    icon: Timer,
    accent: "bg-warning-accent",
    iconWrap: "bg-warning-subtle",
    iconColor: "text-warning-fg",
    spark: "stroke-warning-accent",
    sparkFill: "fill-warning-accent/15",
  },
  ReadyOrDispatched: {
    icon: PackageCheck,
    accent: "bg-success-fg",
    iconWrap: "bg-success-subtle",
    iconColor: "text-success-fg",
    spark: "stroke-success-fg",
    sparkFill: "fill-success-fg/10",
  },
  Completed: {
    icon: CheckCircle2,
    accent: "bg-neutral-fg",
    iconWrap: "bg-neutral-subtle",
    iconColor: "text-neutral-fg",
    spark: "stroke-neutral-fg",
    sparkFill: "fill-neutral-fg/10",
  },
  Rejected: {
    icon: XCircle,
    accent: "bg-danger-fg",
    iconWrap: "bg-danger-subtle",
    iconColor: "text-danger-fg",
    spark: "stroke-danger-fg",
    sparkFill: "fill-danger-fg/10",
  },
};

/** Deterministic mini sparkline path from a count (visual only). */
function sparkPoints(count: number, seed: number): string {
  const vals = Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((i + 1) * 0.9 + seed) * 0.35 + 0.55;
    const level = count === 0 ? 0.15 : Math.min(0.95, wave + count * 0.04);
    return level;
  });
  const w = 120;
  const h = 36;
  const step = w / (vals.length - 1);
  return vals
    .map((v, i) => {
      const x = i * step;
      const y = h - v * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function sparkArea(count: number, seed: number): string {
  const line = sparkPoints(count, seed);
  return `${line} L120,36 L0,36 Z`;
}

export function StatusFilterChips({
  activeKey,
  statusCounts,
  search,
}: {
  activeKey: string;
  statusCounts: Record<string, number>;
  search?: string;
}) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7"
      role="group"
      aria-label="Filter by status"
    >
      {QUEUE_FILTERS.map((filter, index) => {
        const count =
          filter.status === null ? total : (statusCounts[filter.status] ?? 0);
        const active = activeKey === filter.key;
        const tone = TONES[filter.key] ?? TONES.all;
        const Icon = tone.icon;

        const params = new URLSearchParams();
        if (filter.key !== "all") params.set("status", filter.key);
        if (search) params.set("search", search);
        const href = params.size ? `/admin?${params}` : "/admin";

        return (
          <Link
            key={filter.key}
            href={href}
            className={cn(
              "focus-ring group relative flex h-full min-h-[10.5rem] flex-col overflow-hidden rounded-card border bg-surface p-4 shadow-[var(--shadow-md)] transition-[border-color,box-shadow,transform] duration-[150ms] ease-out",
              active
                ? "border-brand-600 ring-1 ring-brand-600/20"
                : "border-line hover:border-brand-200 hover:shadow-[var(--shadow-lg)]",
            )}
            aria-current={active ? "true" : undefined}
          >
            <span
              className={cn("absolute inset-x-0 top-0 h-[3px]", tone.accent)}
              aria-hidden
            />

            <span
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-control",
                tone.iconWrap,
              )}
            >
              <Icon className={cn("h-5 w-5", tone.iconColor)} aria-hidden />
            </span>

            <p className="mt-3 line-clamp-2 min-h-[2rem] text-xs font-semibold leading-4 text-ink-muted">
              {filter.label}
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold tracking-tight tabular-nums",
                active ? "text-brand-800" : "text-heading",
              )}
            >
              {count}
            </p>

            <svg
              viewBox="0 0 120 36"
              className="mt-auto h-9 w-full pt-3"
              aria-hidden
              preserveAspectRatio="none"
            >
              <path d={sparkArea(count, index)} className={tone.sparkFill} />
              <path
                d={sparkPoints(count, index)}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={tone.spark}
              />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
