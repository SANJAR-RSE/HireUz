const express = require("express");
const { getMyProfile, updateMyProfile, getCompanyProfile } = require("../controllers/profiles.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);
router.get("/company/:userId", getCompanyProfile);

module.exports = router;
