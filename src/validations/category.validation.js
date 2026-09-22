const { z } = require("zod");

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Category id must be a number" }).int().positive(),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
  }),
});

const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Category id must be a number" }).int().positive(),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
};