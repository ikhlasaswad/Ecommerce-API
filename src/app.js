const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const reviewRoutes = require("./routes/review.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const { handleStripeWebhook } = require("./controllers/payment.controller");
const { errorHandler } = require("./middleware/errorHandler.middleware");
const { notFound } = require("./middleware/notFound.middleware");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // lets a frontend on another origin load /uploads images
app.use(cors());

// IMPORTANT: Stripe needs the raw, unparsed request body to verify its
// signature, so this route is registered BEFORE express.json() below.
// If it were declared after, the body would already be parsed to JSON
// and signature verification would always fail.
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce API is running",
  });
});

// Keep these two last, in this order
app.use(notFound);
app.use(errorHandler);

module.exports = app;