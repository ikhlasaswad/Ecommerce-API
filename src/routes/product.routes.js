const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  getProductsQuerySchema,
} = require("../validations/product.validation");

const router = express.Router();

// Public
router.get("/", validate(getProductsQuerySchema), getAllProducts);
router.get("/:id", validate(productIdParamSchema), getProductById);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProduct
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(productIdParamSchema),
  deleteProduct
);

module.exports = router;