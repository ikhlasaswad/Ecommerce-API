const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const {
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
} = require("../validations/order.validation");

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order (atomically decrements stock; fails per-item if insufficient)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: integer }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Order placed }
 *       409: { description: Insufficient stock for one of the items }
 *   get:
 *     tags: [Orders]
 *     summary: List all orders across all users (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated order list }
 */
router.post("/", validate(createOrderSchema), createOrder);
router.get("/", authorize("ADMIN"), validate(getOrdersQuerySchema), getAllOrders);

/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: List the authenticated user's own orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated order list }
 */
router.get("/my", validate(getOrdersQuerySchema), getMyOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by id (its owner, or any admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order found }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.get("/:id", validate(orderIdParamSchema), getOrderById);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (admin only; CANCELLED restores stock)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200: { description: Status updated }
 *       409: { description: Order already DELIVERED or CANCELLED }
 */
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

module.exports = router;