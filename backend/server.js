const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* Productive sites list (backend auto-classification) */
const productiveSites = [
  "github.com",
  "leetcode.com",
  "stackoverflow.com",
  "chatgpt.com",
  "localhost",
  "127.0.0.1"
];

/* MongoDB Connection */
mongoose
  .connect("mongodb://127.0.0.1:27017/productivity")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

/* Schema */
const TimeLogSchema = new mongoose.Schema({
  site: String,
  time: Number,
  category: String,
  date: { type: Date, default: Date.now }
});

const TimeLog = mongoose.model("TimeLog", TimeLogSchema);

/* Log Data from Extension */
app.post("/log", async (req, res) => {
  const { site, time } = req.body;

  const category = productiveSites.includes(site)
    ? "productive"
    : "unproductive";

  await TimeLog.create({ site, time, category });

  res.json({ message: "saved", category });
});

/* Get All Raw Data */
app.get("/data", async (req, res) => {
  const data = await TimeLog.find();
  res.json(data);
});

/* Weekly Productivity Report */
app.get("/weekly-report", async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 7);

  const data = await TimeLog.find({ date: { $gte: start } });

  let productive = 0;
  let unproductive = 0;

  data.forEach(item => {
    if (item.category === "productive") {
      productive += item.time;
    } else {
      unproductive += item.time;
    }
  });

  res.json({
    productive,
    unproductive,
    total: productive + unproductive
  });
});

/* Server */
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
