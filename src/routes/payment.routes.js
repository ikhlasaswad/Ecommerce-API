const express = require("express");
const {
  createPaymentIntent,
  getPaymentStatus,
} = require("../controllers/payment.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { orderIdParamSchema } = require("../validations/payment.validation");

// Note: the Stripe webhook route is NOT here — it's mounted separately and
// earlier in app.js, before express.json(), because it needs the raw body.
const router = express.Router();

router.use(authenticate);

router.post(
  "/:orderId/create-intent",
  validate(orderIdParamSchema),
  createPaymentIntent
);
router.get("/:orderId", validate(orderIdParamSchema), getPaymentStatus);

module.exports = router;