const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"], required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    coverNote: { type: String, default: "" },
    cvUrl: { type: String, default: null },
    statusHistory: { type: [statusHistorySchema], default: () => [{ status: "PENDING" }] },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
