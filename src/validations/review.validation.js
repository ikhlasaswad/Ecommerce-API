const { z } = require("zod");

const createReviewSchema = z.object({
  params: z.object({
    productId: z.coerce.number({ invalid_type_error: "Product id must be a number" }).int().positive(),
  }),
  body: z.object({
    rating: z.coerce
      .number({ required_error: "Rating is required", invalid_type_error: "Rating must be a number" })
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z.string().trim().max(1000, "Comment must be at most 1000 characters").optional(),
  }),
});

const updateReviewSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Review id must be a number" }).int().positive(),
  }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(1000).optional(),
  }),
});

const reviewIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Review id must be a number" }).int().positive(),
  }),
});

const productIdParamSchema = z.object({
  params: z.object({
    productId: z.coerce.number({ invalid_type_error: "Product id must be a number" }).int().positive(),
  }),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  productIdParamSchema,
};