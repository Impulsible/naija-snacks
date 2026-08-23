// server/src/models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  allergens: string[];
  stock: number;
  featured: boolean;
  popular: boolean;
  isActive: boolean;
  prepTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    ingredients: [
      {
        type: String,
        required: true,
      },
    ],
    allergens: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual getter for singular 'image' property (returns the first image from array)
productSchema.virtual('image').get(function (this: IProduct) {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default Product;