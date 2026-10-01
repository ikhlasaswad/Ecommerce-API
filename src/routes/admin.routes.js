const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
} = require("../controllers/admin.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const {
  getUsersQuerySchema,
  userIdParamSchema,
  updateUserRoleSchema,
} = require("../validations/admin.validation");

const router = express.Router();

// Every route here is admin-only.
router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getDashboardStats);
router.get("/users", validate(getUsersQuerySchema), getAllUsers);
router.get("/users/:id", validate(userIdParamSchema), getUserById);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);

module.exports = router;