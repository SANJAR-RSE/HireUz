const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: String, default: "" },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    location: { type: String, default: "" },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship", "contract"],
      default: "full-time",
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
