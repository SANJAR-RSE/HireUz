const Job = require("../models/Job");
const Application = require("../models/Application");

async function createJob(req, res, next) {
  try {
    const { title, description, requirements, salaryMin, salaryMax, location, employmentType, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Sarlavha va tavsif majburiy" });
    }

    const job = await Job.create({
      employer: req.user.id,
      title,
      description,
      requirements,
      salaryMin,
      salaryMax,
      location,
      employmentType,
      category: category || null,
    });

    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
}

async function listJobs(req, res, next) {
  try {
    const { category, location, minSalary, maxSalary, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (search) filter.title = { $regex: search, $options: "i" };
    if (minSalary) filter.salaryMax = { $gte: Number(minSalary) };
    if (maxSalary) filter.salaryMin = { $lte: Number(maxSalary) };

    const jobs = await Job.find(filter)
      .populate("category", "name")
      .populate("employer", "name")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

async function getJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id)
      .populate("category", "name")
      .populate("employer", "name");
    if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
    res.json({ job });
  } catch (err) {
    next(err);
  }
}

async function myJobs(req, res, next) {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });
    const jobIds = jobs.map((j) => j._id);
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const result = jobs.map((j) => ({ ...j.toObject(), applicationCount: countMap[j._id.toString()] || 0 }));
    res.json({ jobs: result });
  } catch (err) {
    next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu vakansiyani tahrirlash huquqingiz yo'q" });
    }
    Object.assign(job, req.body);
    await job.save();
    res.json({ job });
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Vakansiya topilmadi" });
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu vakansiyani o'chirish huquqingiz yo'q" });
    }
    job.isActive = false;
    await job.save();
    res.json({ message: "Vakansiya o'chirildi" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createJob, listJobs, getJob, myJobs, updateJob, deleteJob };
