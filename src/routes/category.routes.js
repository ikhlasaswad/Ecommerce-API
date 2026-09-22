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
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} = require("../validations/category.validation");

const router = express.Router();

// Public
router.get("/", getAllCategories);
router.get("/:id", validate(categoryIdParamSchema), getCategoryById);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);
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