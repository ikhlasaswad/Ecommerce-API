const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),

    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters") // bcrypt limit
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
  }),
});

module.exports = { registerSchema };