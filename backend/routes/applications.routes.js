const express = require("express");
const {
  applyToJob,
  myApplications,
  applicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applications.controller");
const { auth, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/jobs/:jobId/apply", auth, requireRole("candidate"), upload.single("cv"), applyToJob);
router.get("/mine", auth, requireRole("candidate"), myApplications);
router.get("/jobs/:jobId", auth, requireRole("employer"), applicationsForJob);
router.patch("/:id/status", auth, requireRole("employer"), updateApplicationStatus);

module.exports = router;
