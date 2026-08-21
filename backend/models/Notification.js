const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["NEW_APPLICATION", "STATUS_CHANGED"],
      required: true,
    },
    message: { type: String, required: true },
    relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
