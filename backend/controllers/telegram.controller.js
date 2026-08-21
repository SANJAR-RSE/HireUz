const User = require("../models/User");
const TelegramConnection = require("../models/TelegramConnection");

// Bot jarayoni /start <code> qabul qilganda shu endpointga murojaat qiladi (bitta backend, bitta manba).
async function linkTelegram(req, res, next) {
  try {
    const { code, chatId } = req.body;
    if (!code || !chatId) return res.status(400).json({ message: "code va chatId majburiy" });

    const user = await User.findOne({ telegramLinkCode: code });
    if (!user) return res.status(400).json({ message: "Kod noto'g'ri yoki muddati o'tgan" });

    user.telegramChatId = String(chatId);
    user.telegramLinkCode = null;
    await user.save();

    await TelegramConnection.findOneAndUpdate(
      { user: user._id },
      { chatId: String(chatId), linkedAt: new Date() },
      { upsert: true }
    );

    res.json({ message: "Telegram ulandi", name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
}

module.exports = { linkTelegram };
