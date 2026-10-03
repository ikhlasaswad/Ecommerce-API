const prisma = require("../config/database");
const { invalidateCache } = require("../middleware/cache.middleware");

const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId; // from authenticate middleware

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = await prisma.review.create({
      data: { rating, comment, userId, productId },
      include: { user: { select: { id: true, name: true } } },
    });

    await invalidateCache("products"); // product detail embeds its reviews

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    // @@unique([userId, productId]) — one review per user per product
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [reviews, total, avg] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      averageRating: avg._avg.rating ? Number(avg._avg.rating.toFixed(2)) : null,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only the review's author can edit it — admins moderate via delete, not edit.
    if (existing.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own review",
      });
    }

    const review = await prisma.review.update({
      where: { id },
      data: updates,
      include: { user: { select: { id: true, name: true } } },
    });

    await invalidateCache("products");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // The author can delete their own review; an admin can moderate anyone's.
    if (existing.userId !== userId && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this review",
      });
    }

    await prisma.review.delete({ where: { id } });

    await invalidateCache("products");

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
};