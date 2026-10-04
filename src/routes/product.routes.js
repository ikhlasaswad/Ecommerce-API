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

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with filtering, search, sorting and pagination
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive match on product name
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [price, createdAt, name], default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, categoryId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, example: 99.99 }
 *               stock: { type: integer, default: 0 }
 *               categoryId: { type: integer }
 *     responses:
 *       201: { description: Product created }
 *       400: { description: Invalid categoryId }
 */
router.get("/", validate(getProductsQuerySchema), cache("products"), getAllProducts);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  createProduct
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by id (includes reviews)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product found }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *   patch:
 *     tags: [Products]
 *     summary: Update a product (admin only, partial update)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Product' }
 *     responses:
 *       200: { description: Product updated }
 *   delete:
 *     tags: [Products]
 *     summary: Soft-delete a product (admin only — sets isActive to false)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product deleted }
 */
router.get("/:id", validate(productIdParamSchema), cache("products"), getProductById);
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

/**
 * @openapi
 * /products/{id}/image:
 *   post:
 *     tags: [Products]
 *     summary: Upload/replace a product's image (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Image uploaded, product.imageUrl updated }
 *       400: { description: Invalid file type or size (max 5MB) }
 */
router.post(
  "/:id/image",
  authenticate,
  authorize("ADMIN"),
  validate(productIdParamSchema),
  uploadImage,
  uploadProductImage
);

/**
 * @openapi
 * /products/{productId}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a product (includes average rating)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reviews with averageRating
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a review for a product (one per user per product)
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review submitted }
 *       409: { description: You have already reviewed this product }
 */
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