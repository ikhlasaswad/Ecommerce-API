const express = require("express");
const { updateReview, deleteReview } = require("../controllers/review.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const {
  updateReviewSchema,
  reviewIdParamSchema,
} = require("../validations/review.validation");

const router = express.Router();

/**
 * @openapi
 * /reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update your own review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200: { description: Review updated }
 *       403: { description: You can only edit your own review }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (the author, or any admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Review deleted }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 */
router.patch("/:id", authenticate, validate(updateReviewSchema), updateReview);
router.delete("/:id", authenticate, validate(reviewIdParamSchema), deleteReview);

module.exports = router;