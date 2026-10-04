const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "A full-featured e-commerce backend: JWT auth, products, categories, reviews, orders, Stripe payments, and an admin dashboard.",
    },
    servers: [{ url: "/api", description: "Base API path" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string", nullable: true },
            price: { type: "string", example: "99.99" },
            stock: { type: "integer" },
            imageUrl: { type: "string", nullable: true },
            categoryId: { type: "integer" },
            isActive: { type: "boolean" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", nullable: true },
            userId: { type: "integer" },
            productId: { type: "integer" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            productId: { type: "integer" },
            quantity: { type: "integer" },
            price: { type: "string" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            totalAmount: { type: "string" },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
            },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            orderId: { type: "integer" },
            provider: { type: "string", example: "STRIPE" },
            amount: { type: "string" },
            status: { type: "string", enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"] },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Missing or invalid access token",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        ForbiddenError: {
          description: "Authenticated but not allowed to perform this action",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        NotFoundError: {
          description: "Resource not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        ValidationError: {
          description: "Request failed validation",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    security: [{ bearerAuth: [] }], // default; overridden per-route with `security: []` for public ones
  },
  // Reads JSDoc @openapi/@swagger comments from every route file.
  apis: ["./src/routes/*.routes.js"],
};

module.exports = swaggerJsdoc(options);