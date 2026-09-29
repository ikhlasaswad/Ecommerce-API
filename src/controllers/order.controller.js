const prisma = require("../config/database");

class InsufficientStockError extends Error {
  constructor(productName) {
    super(`Insufficient stock for "${productName}"`);
    this.name = "InsufficientStockError";
  }
}

const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }, ...]
    const userId = req.user.userId;

    // De-duplicate: if the client sent the same productId twice, merge quantities
    // instead of racing two separate decrements against the same row.
    const mergedItems = Object.values(
      items.reduce((acc, item) => {
        if (acc[item.productId]) {
          acc[item.productId].quantity += item.quantity;
        } else {
          acc[item.productId] = { ...item };
        }
        return acc;
      }, {})
    );

    const order = await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      let totalAmount = 0;

      for (const { productId, quantity } of mergedItems) {
        const product = await tx.product.findFirst({
          where: { id: productId, isActive: true },
        });

        if (!product) {
          const error = new Error(`Product ${productId} not found`);
          error.statusCode = 404;
          throw error;
        }

        // Atomic, race-safe stock decrement: only succeeds if enough stock is
        // still available at the moment this runs, even under concurrent orders.
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });

        if (updated.count === 0) {
          throw new InsufficientStockError(product.name);
        }

        const price = product.price; // snapshot the price at time of purchase
        orderItemsData.push({ productId, quantity, price });
        totalAmount += Number(price) * quantity;
      }

      return tx.order.create({
        data: {
          userId,
          totalAmount,
          items: { create: orderItemsData },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return res.status(409).json({ success: false, message: error.message });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, status } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId, ...(status && { status }) };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // A customer can only see their own order; an admin can see any.
    if (order.userId !== userId && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this order",
      });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (existing.status === "CANCELLED" || existing.status === "DELIVERED") {
      return res.status(409).json({
        success: false,
        message: `Cannot change status of an order that is already ${existing.status}`,
      });
    }

    // Cancelling restores stock; any other transition just updates the status.
    const order = await prisma.$transaction(async (tx) => {
      if (status === "CANCELLED") {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({ where: { id }, data: { status } });
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};