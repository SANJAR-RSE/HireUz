const mongoose = require("mongoose");

const candidateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    cvUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CandidateProfile", candidateProfileSchema);
