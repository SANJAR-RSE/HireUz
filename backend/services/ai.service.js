const Job = require("../models/Job");
const Application = require("../models/Application");
const CandidateProfile = require("../models/CandidateProfile");

// HireUz AI — soddalashtirilgan, tarafkashliksiz moslik mexanizmi.
// Faqat backend'dagi REAL vakansiya/nomzod ma'lumoti bilan ishlaydi, hech narsa to'qimaydi.
// Irq/jins/yosh/millat kabi himoyalangan xususiyatlar umuman saqlanmaydi va ishlatilmaydi —
// faqat ko'nikma/tajriba/matn moslikka qaraladi.

function scoreText(text, keywords) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => (lower.includes(kw.toLowerCase()) ? score + 1 : score), 0);
}

async function recommendJobsForCandidate(userId, queryText = "") {
  const profile = await CandidateProfile.findOne({ user: userId });
  const skills = profile?.skills || [];
  const keywords = [...skills, ...queryText.split(/\s+/).filter(Boolean)];

  const jobs = await Job.find({ isActive: true }).populate("category", "name");
  if (keywords.length === 0) {
    return jobs.slice(0, 5).map((j) => ({ job: j, matchScore: 0 }));
  }

  const scored = jobs.map((job) => {
    const haystack = `${job.title} ${job.description} ${job.requirements}`;
    const matchScore = scoreText(haystack, keywords);
    return { job, matchScore };
  });

  return scored
    .filter((s) => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

async function summarizeApplicantsForJob(jobId) {
  const applications = await Application.find({ job: jobId })
    .populate({ path: "candidate", select: "name" })
    .populate({ path: "job", select: "title requirements" });

  if (applications.length === 0) return { summary: "Hozircha arizalar yo'q.", items: [] };

  const job = applications[0].job;
  const requirementWords = (job.requirements || "").split(/[,\n]/).map((w) => w.trim()).filter(Boolean);

  const items = [];
  for (const app of applications) {
    const profile = await CandidateProfile.findOne({ user: app.candidate._id });
    const skills = profile?.skills || [];
    const matched = requirementWords.filter((req) =>
      skills.some((s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
    );
    items.push({
      candidateName: app.candidate.name,
      applicationId: app._id,
      status: app.status,
      experienceYears: profile?.experienceYears || 0,
      matchedRequirements: matched,
      matchScore: matched.length,
    });
  }

  items.sort((a, b) => b.matchScore - a.matchScore);

  const summary =
    `"${job.title}" bo'yicha ${applications.length} ta ariza tahlil qilindi. ` +
    `Yakuniy qarorni ish beruvchi qabul qiladi — bu faqat ko'nikma moslik xulosasi.`;

  return { summary, items };
}

module.exports = { recommendJobsForCandidate, summarizeApplicantsForJob };
