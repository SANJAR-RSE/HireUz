const express = require("express");
const { linkTelegram } = require("../controllers/telegram.controller");

const router = express.Router();

router.post("/link", linkTelegram);

module.exports = router;
