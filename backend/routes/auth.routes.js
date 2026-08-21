const express = require("express");
const { register, login, me, getTelegramLinkCode } = require("../controllers/auth.controller");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", upload.single("cv"), register);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/telegram-link-code", auth, getTelegramLinkCode);

module.exports = router;
