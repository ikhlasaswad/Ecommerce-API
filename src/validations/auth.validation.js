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

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Refresh token is required"),
  }),
});

const strongPassword = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: "Current password is required" })
        .min(1, "Current password is required"),
      newPassword: strongPassword,
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({ required_error: "Reset token is required" })
      .min(1, "Reset token is required"),
    newPassword: strongPassword,
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};