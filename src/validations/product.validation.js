const { z } = require("zod");

const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(200, "Name must be at most 200 characters"),

    description: z
      .string()
      .trim()
      .max(2000, "Description must be at most 2000 characters")
      .optional(),

    price: z.coerce
      .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
      .positive("Price must be greater than 0")
      .multipleOf(0.01, "Price can have at most 2 decimal places"),

    stock: z.coerce
      .number({ invalid_type_error: "Stock must be a number" })
      .int("Stock must be a whole number")
      .nonnegative("Stock cannot be negative")
      .optional()
      .default(0),

    imageUrl: z.string().trim().url("Image URL must be a valid URL").optional(),

    categoryId: z.coerce
      .number({ required_error: "Category id is required", invalid_type_error: "Category id must be a number" })
      .int()
      .positive(),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Product id must be a number" }).int().positive(),
  }),
  body: z.object({
    name: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().positive().multipleOf(0.01).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    imageUrl: z.string().trim().url().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  }),
});

const productIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Product id must be a number" }).int().positive(),
  }),
});

const getProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    categoryId: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(["price", "createdAt", "name"]).optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  getProductsQuerySchema,
};