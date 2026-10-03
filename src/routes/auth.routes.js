const express = require("express");
const {
  register,
  login,
  getMe,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authLimiter } = require("../middleware/rateLimiter.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", validate(refreshTokenSchema), logout);

router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes — require a valid access token
router.get("/me", authenticate, getMe);
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

module.exports = router;