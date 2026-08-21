const express = require("express");
const { recommendForMe, summarizeApplicants } = require("../controllers/ai.controller");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/recommend", auth, requireRole("candidate"), recommendForMe);
router.get("/jobs/:jobId/summarize-applicants", auth, requireRole("employer"), summarizeApplicants);

module.exports = router;
