import { Card } from "./Card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="text-center">
      <p className="font-display text-3xl font-semibold text-accent">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
