const { z } = require("zod");

const getUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
    search: z.string().trim().min(1).optional(), // matches name or email
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "User id must be a number" }).int().positive(),
  }),
});

const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.coerce.number({ invalid_type_error: "User id must be a number" }).int().positive(),
  }),
  body: z.object({
    role: z.enum(["CUSTOMER", "ADMIN"], { required_error: "role is required" }),
  }),
});

module.exports = { getUsersQuerySchema, userIdParamSchema, updateUserRoleSchema };