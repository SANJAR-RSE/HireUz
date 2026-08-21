const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CandidateProfile = require("../models/CandidateProfile");
const CompanyProfile = require("../models/CompanyProfile");
const generateToken = require("../utils/generateToken");
const generateLinkCode = require("../utils/generateLinkCode");

async function register(req, res, next) {
  try {
    const { name, email, password, role, companyName, category } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }
    if (!["candidate", "employer"].includes(role)) {
      return res.status(400).json({ message: "Rol noto'g'ri" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Parol kamida 6 belgidan iborat bo'lishi kerak" });
    }
    if (role === "candidate" && !category) {
      return res.status(400).json({ message: "Sohangizni tanlang (masalan: Dasturlash, Dizayn)" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    if (role === "candidate") {
      const cvUrl = req.file ? `/uploads/${req.file.filename}` : null;
      await CandidateProfile.create({ user: user._id, category: category || null, cvUrl });
    } else {
      await CompanyProfile.create({ user: user._id, companyName: companyName || name, category: category || null });
    }

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email va parolni kiriting" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        telegramChatId: user.telegramChatId,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTelegramLinkCode(req, res, next) {
  try {
    const code = generateLinkCode();
    await User.findByIdAndUpdate(req.user.id, { telegramLinkCode: code });
    res.json({ code, botUsername: process.env.BOT_USERNAME || null });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, getTelegramLinkCode };
