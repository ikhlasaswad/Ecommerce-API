const path = require("path");
const fs = require("fs/promises");
const prisma = require("../config/database");
const { invalidateCache } = require("../middleware/cache.middleware");

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    const product = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, categoryId },
    });

    await invalidateCache("products");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // categoryId points to a category that doesn't exist
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId — category does not exist",
      });
    }
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, categoryId, minPrice, maxPrice, search, sortBy, order } = req.query;

    // Only active products are ever shown through the public listing.
    const where = { isActive: true };

    if (categoryId) where.categoryId = categoryId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body; // only the fields the client sent, all optional

    const product = await prisma.product.update({
      where: { id },
      data: updates,
    });

    await invalidateCache("products");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId — category does not exist",
      });
    }
    next(error);
  }
};

// Soft delete — matches the isActive flag added to the schema earlier.
// The product row stays (so past OrderItems keep referencing it), it just
// stops showing up in the public listing/detail endpoints.
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await invalidateCache("products");

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    next(error);
  }
};

const removeFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File already gone or never existed — nothing to clean up.
  }
};

const uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required (form-data field name: "image")',
      });
    }

    const existing = await prisma.product.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      await removeFile(req.file.path); // multer already saved it, so clean up
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    const product = await prisma.product.update({
      where: { id },
      data: { imageUrl },
    });

    // Replace, don't accumulate: delete the previous local image if there was one.
    if (existing.imageUrl && existing.imageUrl.startsWith("/uploads/products/")) {
      await removeFile(path.join(process.cwd(), existing.imageUrl));
    }

    await invalidateCache("products");

    return res.status(200).json({
      success: true,
      message: "Product image uploaded successfully",
      data: product,
    });
  } catch (error) {
    if (req.file) await removeFile(req.file.path);
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};