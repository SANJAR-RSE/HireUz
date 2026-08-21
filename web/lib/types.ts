export type Role = "candidate" | "employer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  telegramChatId?: string | null;
};

export type Category = { _id: string; name: string };

export type Job = {
  _id: string;
  employer: string | { _id: string; name: string };
  title: string;
  description: string;
  requirements: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  employmentType: "full-time" | "part-time" | "remote" | "internship" | "contract";
  category: Category | null;
  isActive: boolean;
  applicationCount?: number;
  createdAt: string;
};

export type ApplicationStatus = "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";

export type Application = {
  _id: string;
  job: Job | { _id: string; title: string; location?: string; employmentType?: string };
  candidate: string | { _id: string; name: string; email: string };
  employer: string;
  status: ApplicationStatus;
  coverNote: string;
  cvUrl: string | null;
  statusHistory: { status: ApplicationStatus; changedAt: string }[];
  createdAt: string;
};

export type Notification = {
  _id: string;
  type: "NEW_APPLICATION" | "STATUS_CHANGED";
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type CandidateProfile = {
  user: string;
  skills: string[];
  experienceYears: number;
  bio: string;
  cvUrl: string | null;
};

export type CompanyProfile = {
  user: string;
  companyName: string;
  logoUrl: string | null;
  about: string;
  website: string;
};
