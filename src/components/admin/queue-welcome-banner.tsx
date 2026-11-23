import Link from "next/link";
import {
  Activity,
  ClipboardList,
  Pill,
  ShieldCheck,
  Timer,
} from "lucide-react";

function dayGreeting(now: Date, timeZone = "Australia/Sydney"): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", {
      hour: "numeric",
      hour12: false,
      timeZone,
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function QueueWelcomeBanner({
  userName,
  pharmacyName,
  newCount,
  inProgressCount,
  totalCount,
}: {
  userName: string;
  pharmacyName?: string | null;
  newCount: number;
  inProgressCount: number;
  totalCount: number;
}) {
  const greeting = dayGreeting(new Date());
  const name = userName.trim() || "there";

  return (
    <section
      className="relative overflow-hidden rounded-hero bg-brand-800 px-5 py-6 text-white shadow-[var(--shadow-lg)] sm:px-7 sm:py-7"
      aria-label="Orders overview"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,var(--color-brand-800)_0%,var(--color-brand-700)_55%,#2563eb_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-sky-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <Pill
        className="pointer-events-none absolute -right-6 -bottom-8 h-44 w-44 rotate-[-28deg] text-white/10 sm:h-52 sm:w-52"
        strokeWidth={1}
        aria-hidden
      />

      <div className="relative z-[1] flex flex-col gap-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-badge border border-emerald-300/50 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
          <span
            className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.35)]"
            aria-hidden
          />
          All systems operational
        </div>

        <div className="max-w-2xl">
          <h1 className="font-display !text-2xl font-extrabold tracking-tight !text-white sm:!text-3xl">
            {greeting}, {name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-[15px]">
            Review new orders, update fulfilment status, and keep{" "}
            {pharmacyName ? (
              <span className="font-semibold text-white">{pharmacyName}</span>
            ) : (
              "your pharmacy"
            )}{" "}
            running smoothly from one queue.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin?status=Submitted"
              className="focus-ring inline-flex items-center gap-2 rounded-badge bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-[var(--shadow-sm)] transition-opacity hover:bg-brand-50"
            >
              <ClipboardList className="h-4 w-4 text-brand-700" aria-hidden />
              Review new
            </Link>
            <Link
              href="/admin?status=InProgress"
              className="focus-ring inline-flex items-center gap-2 rounded-badge border border-white/50 bg-white/15 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <Timer className="h-4 w-4 text-white" aria-hidden />
              In progress
            </Link>
          </div>

          <span
            className="hidden h-8 w-px bg-white/40 sm:block"
            aria-hidden
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white">
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-200" aria-hidden />
              <span className="tabular-nums font-bold text-white">
                {newCount}
              </span>{" "}
              <span className="text-white/90">new orders</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
              <span className="tabular-nums font-bold text-white">
                {inProgressCount}
              </span>{" "}
              <span className="text-white/90">in progress</span>
              <span className="text-white/60" aria-hidden>
                ·
              </span>
              <span className="tabular-nums font-semibold text-sky-100">
                {totalCount} total
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
