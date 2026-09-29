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

// All order routes require login
router.use(authenticate);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my", validate(getOrdersQuerySchema), getMyOrders);
router.get("/:id", validate(orderIdParamSchema), getOrderById);

// Admin only
router.get("/", authorize("ADMIN"), validate(getOrdersQuerySchema), getAllOrders);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

module.exports = router;