const express = require("express");
const { getMyProfile, updateMyProfile, getCompanyProfile } = require("../controllers/profiles.controller");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/me", auth, getMyProfile);
router.put("/me", auth, upload.single("cv"), updateMyProfile);
router.get("/company/:userId", getCompanyProfile);

module.exports = router;
