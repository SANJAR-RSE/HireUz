const express = require("express");
const { createJob, listJobs, getJob, myJobs, updateJob, deleteJob } = require("../controllers/jobs.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", listJobs);
router.get("/mine", auth, requireRole("employer"), myJobs);
router.get("/:id", getJob);
router.post("/", auth, requireRole("employer"), createJob);
router.put("/:id", auth, requireRole("employer"), updateJob);
router.delete("/:id", auth, requireRole("employer"), deleteJob);

module.exports = router;
