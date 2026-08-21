const Notification = require("../models/Notification");
const { sendTelegramMessage } = require("./telegram.service");

/**
 * Backend hodisasi asosida real notification yaratadi (DB + Telegram, agar ulangan bo'lsa).
 * Fake/hardcoded xabar yuborilmaydi — faqat shu funksiya orqali chaqiriladi.
 */
async function notifyUser({ user, type, message, relatedJob = null, relatedApplication = null }) {
  const notification = await Notification.create({
    user: user._id,
    type,
    message,
    relatedJob,
    relatedApplication,
  });

  if (user.telegramChatId) {
    sendTelegramMessage(user.telegramChatId, message).catch((err) =>
      console.error("Telegram xabar yuborilmadi:", err.message)
    );
  }

  return notification;
}

module.exports = { notifyUser };
