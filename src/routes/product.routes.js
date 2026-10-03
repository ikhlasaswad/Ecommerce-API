const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/product.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const { authorize } = require("../middleware/authorize.middleware");
const { uploadImage } = require("../middleware/upload.middleware");
const { cache } = require("../middleware/cache.middleware");
const {
  createReview,
  getProductReviews,
} = require("../controllers/review.controller");
const {
  createReviewSchema,
  productIdParamSchema: reviewProductIdParamSchema,
} = require("../validations/review.validation");
const {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  getProductsQuerySchema,
} = require("../validations/product.validation");

const router = express.Router();

// Public — cached for 60s, invalidated by cache("products") on any write below
router.get("/", validate(getProductsQuerySchema), cache("products"), getAllProducts);
router.get("/:id", validate(productIdParamSchema), cache("products"), getProductById);

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

router.post(
  "/:id/image",
  authenticate,
  authorize("ADMIN"),
  validate(productIdParamSchema),
  uploadImage,
  uploadProductImage
);

// Reviews nested under a product
router.get(
  "/:productId/reviews",
  validate(reviewProductIdParamSchema),
  getProductReviews
);
router.post(
  "/:productId/reviews",
  authenticate,
  validate(createReviewSchema),
  createReview
);

module.exports = router;