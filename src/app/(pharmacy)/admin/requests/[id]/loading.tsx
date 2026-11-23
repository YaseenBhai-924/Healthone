export default function RequestDetailLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-32 rounded-control bg-surface-muted" />
      <div className="h-10 w-56 rounded-control bg-surface-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-card border border-subtle bg-surface" />
        <div className="h-64 rounded-card border border-subtle bg-surface" />
      </div>
    </div>
  );
}
