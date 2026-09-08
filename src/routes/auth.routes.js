const express = require("express");
const { register } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { registerSchema } = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), register);

module.exports = router;
