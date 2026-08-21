import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Yuborildi",
  REVIEWING: "Ko'rib chiqilmoqda",
  ACCEPTED: "Qabul qilindi",
  REJECTED: "Rad etildi",
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  REVIEWING: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
