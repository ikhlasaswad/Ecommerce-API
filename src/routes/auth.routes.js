const express = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected route — requires a valid access token
router.get("/me", authenticate, getMe);

module.exports = router;