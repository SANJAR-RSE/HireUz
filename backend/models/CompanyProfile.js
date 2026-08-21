const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: null },
    about: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);
