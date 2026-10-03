const rateLimit = require("express-rate-limit");

// Generous general limit — protects against accidental loops / scraping
// without getting in a normal user's way.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // adds RateLimit-* response headers
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Tighter limit for auth routes — these are the ones brute-force/credential
// stuffing actually targets (login, register, password reset).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

module.exports = { generalLimiter, authLimiter };