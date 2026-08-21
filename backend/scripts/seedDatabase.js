require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CandidateProfile = require("../models/CandidateProfile");
const CompanyProfile = require("../models/CompanyProfile");
const Category = require("../models/Category");
const Job = require("../models/Job");
const Application = require("../models/Application");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB ulandi, seed boshlanmoqda...");

  await Promise.all([
    User.deleteMany({}),
    CandidateProfile.deleteMany({}),
    CompanyProfile.deleteMany({}),
    Category.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  const categoryNames = ["Dasturlash", "Dizayn", "Marketing", "Sotuv", "Moliya"];
  const categories = await Category.insertMany(categoryNames.map((name) => ({ name })));

  const password = await bcrypt.hash("password123", 10);

  const employersData = [
    { name: "TechNova admin", email: "employer1@hireuz.uz", company: "TechNova" },
    { name: "Alfa Group admin", email: "employer2@hireuz.uz", company: "Alfa Group" },
    { name: "GreenSoft admin", email: "employer3@hireuz.uz", company: "GreenSoft" },
  ];

  const employers = [];
  for (const e of employersData) {
    const user = await User.create({ name: e.name, email: e.email, password, role: "employer" });
    await CompanyProfile.create({
      user: user._id,
      companyName: e.company,
      about: `${e.company} — O'zbekistondagi yetakchi IT/xizmat kompaniyalaridan biri.`,
    });
    employers.push(user);
  }

  const candidatesData = [
    { name: "Aziz Karimov", email: "candidate1@hireuz.uz", skills: ["React", "JavaScript", "CSS"], exp: 2 },
    { name: "Dilnoza Yusupova", email: "candidate2@hireuz.uz", skills: ["Node.js", "MongoDB", "Express"], exp: 3 },
    { name: "Sardor Rashidov", email: "candidate3@hireuz.uz", skills: ["Figma", "UI/UX", "Design"], exp: 1 },
  ];

  const candidates = [];
  for (const c of candidatesData) {
    const user = await User.create({ name: c.name, email: c.email, password, role: "candidate" });
    await CandidateProfile.create({
      user: user._id,
      skills: c.skills,
      experienceYears: c.exp,
      bio: `${c.exp} yillik tajribaga ega ${c.skills[0]} mutaxassisi.`,
    });
    candidates.push(user);
  }

  const jobsData = [
    { title: "Frontend Developer (React)", employer: employers[0], category: categories[0], location: "Toshkent", salaryMin: 8000000, salaryMax: 15000000, requirements: "React, JavaScript, CSS" },
    { title: "Backend Developer (Node.js)", employer: employers[0], category: categories[0], location: "Toshkent", salaryMin: 9000000, salaryMax: 16000000, requirements: "Node.js, MongoDB, Express" },
    { title: "UI/UX Dizayner", employer: employers[1], category: categories[1], location: "Toshkent", salaryMin: 6000000, salaryMax: 12000000, requirements: "Figma, UI/UX, Design" },
    { title: "Marketing mutaxassisi", employer: employers[1], category: categories[2], location: "Samarqand", salaryMin: 5000000, salaryMax: 9000000, requirements: "SMM, Marketing" },
    { title: "Sotuv menejeri", employer: employers[2], category: categories[3], location: "Toshkent", salaryMin: 4000000, salaryMax: 10000000, requirements: "Sotuv, Muzokara" },
    { title: "Full-stack Developer", employer: employers[2], category: categories[0], location: "Remote", salaryMin: 10000000, salaryMax: 20000000, requirements: "React, Node.js, MongoDB" },
    { title: "Moliyaviy tahlilchi", employer: employers[0], category: categories[4], location: "Toshkent", salaryMin: 6000000, salaryMax: 11000000, requirements: "Excel, Moliya" },
    { title: "Junior Frontend Developer", employer: employers[1], category: categories[0], location: "Buxoro", salaryMin: 4000000, salaryMax: 7000000, requirements: "JavaScript, CSS, React" },
  ];

  const jobs = [];
  for (const j of jobsData) {
    const job = await Job.create({
      employer: j.employer._id,
      title: j.title,
      description: `${j.title} lavozimiga jamoamizga taklif qilamiz. Qulay ish sharoiti va rivojlanish imkoniyati.`,
      requirements: j.requirements,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      location: j.location,
      category: j.category._id,
    });
    jobs.push(job);
  }

  await Application.create({
    job: jobs[0]._id,
    candidate: candidates[0]._id,
    employer: jobs[0].employer,
    coverNote: "Men React bo'yicha 2 yillik tajribaga egaman.",
    status: "PENDING",
    statusHistory: [{ status: "PENDING" }],
  });

  await Application.create({
    job: jobs[1]._id,
    candidate: candidates[1]._id,
    employer: jobs[1].employer,
    coverNote: "Node.js va MongoDB bilan bir necha loyiha qilganman.",
    status: "REVIEWING",
    statusHistory: [{ status: "PENDING" }, { status: "REVIEWING" }],
  });

  await Application.create({
    job: jobs[2]._id,
    candidate: candidates[2]._id,
    employer: jobs[2].employer,
    coverNote: "Figma bo'yicha portfolio ilova qilaman.",
    status: "ACCEPTED",
    statusHistory: [{ status: "PENDING" }, { status: "REVIEWING" }, { status: "ACCEPTED" }],
  });

  console.log("Seed tugadi:");
  console.log(`- ${employers.length} ish beruvchi (parol: password123)`);
  console.log(`- ${candidates.length} nomzod (parol: password123)`);
  console.log(`- ${jobs.length} vakansiya, 3 ariza (PENDING/REVIEWING/ACCEPTED)`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed xatosi:", err);
  process.exit(1);
});
