import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Helper to create sort object
const buildSortObject = (sortBy: string, order: string): Record<string, 1 | -1> => {
  const sortOrder = order === 'desc' ? -1 : 1;
  return { [sortBy]: sortOrder };
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      featured,
      popular,
      inStock,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    // Build query - only show active products
    const query: any = { isActive: true };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } },
      ];
    }

    // Category
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Featured/Popular
    if (featured) query.featured = featured === 'true';
    if (popular) query.popular = popular === 'true';

    // In stock
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObject = buildSortObject(sortBy as string, order as string);

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Soft Delete (Deactivate) ──────────────────────────────────────
export const deactivateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Activate Product ──────────────────────────────────────────────
export const activateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product activated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Products with Discounts ──────────────────────────────────
export const getDiscountedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { limit = 12 } = req.query;

    const products = await Product.find({
      isActive: true,
      originalPrice: { $exists: true, $ne: null },
      $expr: { $gt: ['$originalPrice', '$price'] },
    })
      .populate('category', 'name slug')
      .sort({ 
        $expr: { $divide: [{ $subtract: ['$originalPrice', '$price'] }, '$originalPrice'] },
        order: -1
      } as any)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Featured Products ──────────────────────────────────────────
export const getFeaturedProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const products = await Product.find({ featured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ rating: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Popular Products ──────────────────────────────────────────
export const getPopularProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const products = await Product.find({ popular: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ reviewCount: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Products by Category ──────────────────────────────────────
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const products = await Product.find({ 
      category: category._id, 
      isActive: true 
    })
      .populate('category', 'name slug')
      .limit(12);

    res.json({
      success: true,
      products,
      category,
    });
  } catch (error) {
    next(error);
  }
};