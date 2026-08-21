const { recommendJobsForCandidate, summarizeApplicantsForJob } = require("../services/ai.service");
const Job = require("../models/Job");

async function recommendForMe(req, res, next) {
  try {
    const query = req.query.q || "";
    const results = await recommendJobsForCandidate(req.user.id, query);
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

async function summarizeApplicants(req, res, next) {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ruxsat yo'q" });
    }
    const result = await summarizeApplicantsForJob(req.params.jobId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { recommendForMe, summarizeApplicants };
