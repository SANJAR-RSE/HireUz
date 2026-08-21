import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Inbox } from "lucide-react";

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="font-medium text-destructive">Xatolik yuz berdi</p>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    </div>
  );
}
