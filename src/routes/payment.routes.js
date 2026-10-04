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

/**
 * @openapi
 * /payments/{orderId}/create-intent:
 *   post:
 *     tags: [Payments]
 *     summary: Create a Stripe PaymentIntent for an order (its owner only)
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Stripe client secret to confirm payment with
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientSecret: { type: string }
 *       409: { description: Order already paid or cancelled }
 */
router.post(
  "/:orderId/create-intent",
  validate(orderIdParamSchema),
  createPaymentIntent
);

/**
 * @openapi
 * /payments/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment status for an order (its owner, or any admin)
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payment record, or null if none exists yet
 *         conatent:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Payment' }
 */
router.get("/:orderId", validate(orderIdParamSchema), getPaymentStatus);

module.exports = router;