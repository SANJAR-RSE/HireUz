import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wallet, Briefcase } from "lucide-react";
import type { Job } from "@/lib/types";

const EMPLOYMENT_LABEL: Record<Job["employmentType"], string> = {
  "full-time": "To'liq stavka",
  "part-time": "Yarim stavka",
  remote: "Masofaviy",
  internship: "Amaliyot",
  contract: "Shartnoma",
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `${(n / 1000000).toFixed(1).replace(".0", "")} mln`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} so'm`;
  return `${fmt((min || max)!)} so'm`;
}

export function JobCard({ job, href }: { job: Job; href: string }) {
  const employerName = typeof job.employer === "object" ? job.employer.name : null;
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary/50 hover:shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            {job.category && <Badge variant="secondary">{job.category.name}</Badge>}
          </div>
          {employerName && <p className="text-sm text-muted-foreground">{employerName}</p>}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> {EMPLOYMENT_LABEL[job.employmentType]}
          </span>
          {salary && (
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" /> {salary}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
