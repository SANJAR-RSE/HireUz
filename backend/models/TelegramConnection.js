const mongoose = require("mongoose");

const telegramConnectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    chatId: { type: String, required: true },
    linkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelegramConnection", telegramConnectionSchema);
