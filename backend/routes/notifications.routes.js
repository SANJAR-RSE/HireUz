const express = require("express");
const { myNotifications, markRead } = require("../controllers/notifications.controller");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, myNotifications);
router.patch("/:id/read", auth, markRead);

module.exports = router;
