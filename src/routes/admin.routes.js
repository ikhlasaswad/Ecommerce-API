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

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard overview — counts, revenue, order status breakdown, recent orders, low stock
 *     responses:
 *       200: { description: Dashboard statistics }
 */
router.get("/stats", getDashboardStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users with pagination, role filter, and search
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [CUSTOMER, ADMIN] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches name or email
 *     responses:
 *       200: { description: Paginated user list }
 */
router.get("/users", validate(getUsersQuerySchema), getAllUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a user's details and recent orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User found }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get("/users/:id", validate(userIdParamSchema), getUserById);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a user's role (cannot change your own)
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [CUSTOMER, ADMIN] }
 *     responses:
 *       200: { description: Role updated }
 *       400: { description: You cannot change your own role }
 */
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);

module.exports = router;