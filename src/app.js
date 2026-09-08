const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running",
  });
});

module.exports = app;