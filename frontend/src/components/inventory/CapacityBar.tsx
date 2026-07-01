import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function CapacityBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, (current / max) * 100);
  const over = current > max;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Capacidade de Carga
          </div>
          <div className="font-mono text-lg">
            <span className={cn(over && "text-destructive font-semibold")}>
              {current.toFixed(1)}
            </span>
            <span className="text-muted-foreground"> / {max.toFixed(1)} kg</span>
          </div>
        </div>
        {over && (
          <div className="flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Sobrecarga!
          </div>
        )}
      </div>
      <Progress
        value={pct}
        className={cn(
          "h-2",
          over && "[&>*]:bg-destructive"
        )}
      />
    </div>
  );
}
