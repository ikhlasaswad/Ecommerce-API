const { z } = require("zod");

const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.coerce.number({ invalid_type_error: "Order id must be a number" }).int().positive(),
  }),
});

module.exports = { orderIdParamSchema };