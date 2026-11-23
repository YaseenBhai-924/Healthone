export default function HqDashboardLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="h-44 rounded-dialog bg-brand-100" />
      <div className="h-40 rounded-dialog bg-surface-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[10.5rem] rounded-dialog bg-surface-muted" />
        ))}
      </div>
      <div className="h-96 rounded-dialog bg-surface-muted" />
    </div>
  );
}
