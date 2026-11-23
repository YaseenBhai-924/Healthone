import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function RequestSearch({
  defaultValue,
  status,
  compact = false,
  id = "request-search",
}: {
  defaultValue?: string;
  status?: string | null;
  /** Pill-style search for the top bar */
  compact?: boolean;
  id?: string;
}) {
  return (
    <form
      method="get"
      action="/admin"
      className={compact ? "w-full" : "flex w-full items-center gap-2"}
    >
      {status && status !== "all" ? (
        <input type="hidden" name="status" value={status} />
      ) : null}
      <label className="sr-only" htmlFor={id}>
        Search by patient name or reference
      </label>
      <div className="relative">
        <Search
          className={
            compact
              ? "pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-fg-muted"
              : "pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-muted"
          }
          aria-hidden
        />
        <Input
          id={id}
          name="search"
          defaultValue={defaultValue}
          placeholder={
            compact ? "Search name or reference" : "Search by name or reference…"
          }
          autoComplete="off"
          maxLength={100}
          className={
            compact
              ? "h-9 rounded-badge border-line bg-surface pl-10 pr-3 text-sm normal-case tracking-normal shadow-[var(--shadow-sm)]"
              : "border-line bg-surface pl-9 text-sm normal-case tracking-normal"
          }
        />
      </div>
    </form>
  );
}
