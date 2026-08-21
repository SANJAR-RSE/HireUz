const Notification = require("../models/Notification");

async function myNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification topilmadi" });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

module.exports = { myNotifications, markRead };
