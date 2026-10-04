const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const { cache } = require("../middleware/cache.middleware");
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} = require("../validations/category.validation");

const router = express.Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     security: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Category' }
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Electronics" }
 *     responses:
 *       201: { description: Category created }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       409: { description: A category with this name already exists }
 */
router.get("/", cache("categories"), getAllCategories);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by id
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category found }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category (admin only)
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
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Category updated }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin only; fails if it still has products)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category deleted }
 *       409: { description: Category still has products }
 */
router.get("/:id", validate(categoryIdParamSchema), cache("categories"), getCategoryById);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(categoryIdParamSchema),
  deleteCategory
);

module.exports = router;