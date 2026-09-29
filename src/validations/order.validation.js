const { z } = require("zod");

const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.coerce.number({ required_error: "productId is required" }).int().positive(),
          quantity: z.coerce
            .number({ required_error: "quantity is required" })
            .int("quantity must be a whole number")
            .positive("quantity must be at least 1"),
        })
      )
      .min(1, "Order must contain at least one item"),
  }),
});

const orderIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Order id must be a number" }).int().positive(),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "Order id must be a number" }).int().positive(),
  }),
  body: z.object({
    status: z.enum(
      ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      { required_error: "status is required" }
    ),
  }),
});

const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    status: z
      .enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
      .optional(),
  }),
});

module.exports = {
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
};