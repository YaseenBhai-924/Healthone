export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-48 rounded-control bg-surface-muted" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-badge bg-surface-muted" />
        ))}
      </div>
      <div className="h-64 rounded-card border border-subtle bg-surface" />
    </div>
  );
}
