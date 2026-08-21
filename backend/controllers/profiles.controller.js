const CandidateProfile = require("../models/CandidateProfile");
const CompanyProfile = require("../models/CompanyProfile");
const Job = require("../models/Job");

async function getMyProfile(req, res, next) {
  try {
    if (req.user.role === "candidate") {
      const profile = await CandidateProfile.findOne({ user: req.user.id }).populate("category", "name");
      return res.json({ profile });
    }
    const profile = await CompanyProfile.findOne({ user: req.user.id }).populate("category", "name");
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    if (req.user.role === "candidate") {
      const { skills, experienceYears, bio, category } = req.body;
      const skillsArray = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      const update = { skills: skillsArray, experienceYears, bio };
      if (category) update.category = category;
      if (req.file) update.cvUrl = `/uploads/${req.file.filename}`;
      const profile = await CandidateProfile.findOneAndUpdate({ user: req.user.id }, update, {
        new: true,
        upsert: true,
      }).populate("category", "name");
      return res.json({ profile });
    }
    const { companyName, about, website, category } = req.body;
    const update = { companyName, about, website };
    if (category) update.category = category;
    const profile = await CompanyProfile.findOneAndUpdate({ user: req.user.id }, update, {
      new: true,
      upsert: true,
    }).populate("category", "name");
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function getCompanyProfile(req, res, next) {
  try {
    const profile = await CompanyProfile.findOne({ user: req.params.userId }).populate("category", "name");
    if (!profile) return res.status(404).json({ message: "Kompaniya topilmadi" });
    const jobs = await Job.find({ employer: req.params.userId, isActive: true }).sort({ createdAt: -1 });
    res.json({ profile, jobs });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile, getCompanyProfile };
