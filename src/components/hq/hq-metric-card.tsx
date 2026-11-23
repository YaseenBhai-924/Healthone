import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const TONES = {
  brand: {
    icon: "bg-brand-50 text-brand-700",
    accent: "bg-brand-600",
    wash: "from-brand-50/80 to-surface",
    spark: "stroke-brand-600",
    sparkFill: "fill-brand-600/10",
  },
  success: {
    icon: "bg-success-subtle text-success-fg",
    accent: "bg-success-fg",
    wash: "from-success-subtle to-surface",
    spark: "stroke-success-fg",
    sparkFill: "fill-success-fg/10",
  },
  warning: {
    icon: "bg-warning-subtle text-warning-fg",
    accent: "bg-warning-accent",
    wash: "from-warning-subtle to-surface",
    spark: "stroke-warning-accent",
    sparkFill: "fill-warning-accent/15",
  },
  info: {
    icon: "bg-info-subtle text-info-fg",
    accent: "bg-info-fg",
    wash: "from-info-subtle to-surface",
    spark: "stroke-info-fg",
    sparkFill: "fill-info-fg/10",
  },
  neutral: {
    icon: "bg-brand-50 text-brand-800",
    accent: "bg-brand-800",
    wash: "from-brand-50/60 to-surface",
    spark: "stroke-brand-800",
    sparkFill: "fill-brand-800/10",
  },
} as const;

export type HqMetricTone = keyof typeof TONES;

/** Deterministic mini sparkline (visual only), same approach as pharmacy chips. */
function sparkPoints(seed: number, strength: number): string {
  const vals = Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((i + 1) * 0.9 + seed) * 0.35 + 0.55;
    const level =
      strength <= 0 ? 0.15 : Math.min(0.95, wave + Math.min(strength, 40) * 0.01);
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

function sparkArea(seed: number, strength: number): string {
  return `${sparkPoints(seed, strength)} L120,36 L0,36 Z`;
}

export function HqMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  sparkSeed = 1,
  sparkStrength = 1,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: HqMetricTone;
  sparkSeed?: number;
  sparkStrength?: number;
  className?: string;
}) {
  const t = TONES[tone];

  return (
    <article
      className={cn(
        "group relative flex min-h-[10.5rem] flex-col overflow-hidden rounded-card border border-line bg-surface p-4 shadow-[var(--shadow-md)] transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-[3px]", t.accent)}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-90",
          t.wash,
        )}
        aria-hidden
      />

      <div className="relative z-[1] flex flex-1 flex-col">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-control shadow-[var(--shadow-sm)]",
            t.icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </p>
        <p className="mt-1 truncate text-2xl font-bold tracking-tight text-heading tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs font-medium text-ink-muted">{hint}</p>
        ) : null}

        <svg
          viewBox="0 0 120 36"
          className="mt-auto h-9 w-full pt-3"
          aria-hidden
          preserveAspectRatio="none"
        >
          <path
            d={sparkArea(sparkSeed, sparkStrength)}
            className={t.sparkFill}
          />
          <path
            d={sparkPoints(sparkSeed, sparkStrength)}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={t.spark}
          />
        </svg>
      </div>
    </article>
  );
}
