const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Prisma known errors that slipped through a controller without local handling
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${err.meta?.target?.join(", ") || "unknown"}`,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
