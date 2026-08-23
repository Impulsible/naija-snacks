import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Naija Snacks API is running' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/naija-snacks';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });