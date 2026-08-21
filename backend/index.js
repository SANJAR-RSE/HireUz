require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const jobsRoutes = require("./routes/jobs.routes");
const applicationsRoutes = require("./routes/applications.routes");
const profilesRoutes = require("./routes/profiles.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const categoriesRoutes = require("./routes/categories.routes");
const aiRoutes = require("./routes/ai.routes");
const telegramRoutes = require("./routes/telegram.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/telegram", telegramRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend ${PORT}-portda ishlamoqda`));
});
