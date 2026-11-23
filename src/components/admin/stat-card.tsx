import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <CardBody className="p-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-heading">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-fg-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
