const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const CandidateProfile = require("../models/CandidateProfile");
const { notifyUser } = require("../services/notification.service");

async function applyToJob(req, res, next) {
  try {
    const { jobId } = req.params;
    const { coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: "Vakansiya topilmadi" });

    const existing = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existing) return res.status(400).json({ message: "Siz bu vakansiyaga allaqachon ariza bergansiz" });

    let cvUrl = null;
    if (req.file) {
      cvUrl = `/uploads/${req.file.filename}`;
    } else {
      const profile = await CandidateProfile.findOne({ user: req.user.id });
      cvUrl = profile?.cvUrl || null;
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      employer: job.employer,
      coverNote: coverNote || "",
      cvUrl,
    });

    const employer = await User.findById(job.employer);
    if (employer) {
      await notifyUser({
        user: employer,
        type: "NEW_APPLICATION",
        message: `Yangi ariza: "${job.title}" vakansiyasiga yangi ariza keldi.`,
        relatedJob: job._id,
        relatedApplication: application._id,
      });
    }

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
}

async function myApplications(req, res, next) {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate({ path: "job", select: "title location employmentType" })
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

async function applicationsForJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu vakansiya arizalarini ko'rish huquqingiz yo'q" });
    }

    const filter = { job: req.params.jobId };
    if (req.query.status) filter.status = req.query.status;

    const applications = await Application.find(filter)
      .populate({ path: "candidate", select: "name email" })
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status noto'g'ri" });
    }

    const application = await Application.findById(req.params.id).populate("job", "title");
    if (!application) return res.status(404).json({ message: "Ariza topilmadi" });
    if (application.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu arizani o'zgartirish huquqingiz yo'q" });
    }

    application.status = status;
    application.statusHistory.push({ status, changedAt: new Date() });
    await application.save();

    if (status === "ACCEPTED" || status === "REJECTED") {
      const candidate = await User.findById(application.candidate);
      if (candidate) {
        const label = status === "ACCEPTED" ? "qabul qilindi" : "rad etildi";
        await notifyUser({
          user: candidate,
          type: "STATUS_CHANGED",
          message: `"${application.job.title}" vakansiyasiga arizangiz ${label}.`,
          relatedJob: application.job._id,
          relatedApplication: application._id,
        });
      }
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
}

module.exports = { applyToJob, myApplications, applicationsForJob, updateApplicationStatus };
