const express = require("express");
const { updateReview, deleteReview } = require("../controllers/review.controller");
const { validate } = require("../middleware/validate.middleware");
const { authenticate } = require("../middleware/authenticate.middleware");
const {
  updateReviewSchema,
  reviewIdParamSchema,
} = require("../validations/review.validation");

const router = express.Router();

// A review's own id is unique on its own, so no need to nest these under /products.
router.patch("/:id", authenticate, validate(updateReviewSchema), updateReview);
router.delete("/:id", authenticate, validate(reviewIdParamSchema), deleteReview);

module.exports = router;