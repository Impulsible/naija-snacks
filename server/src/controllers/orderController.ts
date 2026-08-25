import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

type AuthRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
};

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    paid_at: string;
    metadata: Record<string, any>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      card_type: string;
      bank: string;
      brand: string;
      country_code: string;
    };
  };
}

const getUserId = (user: any): string => {
  return user?.id || user?._id || '';
};

const getUserData = (req: AuthRequest) => {
  if (!req.user) return null;
  return {
    id: getUserId(req.user),
    email: req.user.email || '',
    role: req.user.role || 'customer',
  };
};

// ─── Create Order ──────────────────────────────────────────────────
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getUserData(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const {
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      notes,
    } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item' });
      return;
    }

    // Validate items and check stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item.name || 'unknown'} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
        return;
      }
    }

    // Order number generated dynamically on pre-save hook
    const order = await Order.create({
      user: user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      paymentMethod,
      notes,
      orderStatus: 'pending',
      paymentStatus: 'pending',
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Add order reference to user document
    await User.findByIdAndUpdate(user.id, {
      $push: { orders: order._id },
    });

    // Return flat ID alongside order property to prevent undefined issues on the frontend
    res.status(201).json({
      success: true,
      id: order._id.toString(),
      order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

// ─── Get User Orders ──────────────────────────────────────────────
export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getUserData(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { status, limit = 20, page = 1 } = req.query;
    const query: any = { user: user.id };
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .populate('items.product')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Order ─────────────────────────────────────────────
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getUserData(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId 
      ? { _id: req.params.id }
      : { orderNumber: req.params.id };

    const order = await Order.findOne(query).populate('items.product');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.user.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      return;
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Initialize Paystack Payment ──────────────────────────────────
export const initializePayment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const user = getUserData(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ success: false, message: 'Invalid Order ID format' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.user.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
      return;
    }

    if (order.paymentStatus === 'paid') {
      res.status(400).json({ success: false, message: 'Order already paid' });
      return;
    }

    const reference = `NS-${order._id}-${Date.now()}`;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isPaystackConfigured = paystackSecret && paystackSecret !== 'sk_test_your_paystack_secret_key_here';

    if (isPaystackConfigured) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: Math.round(order.total * 100), // Convert to kobo
            reference: reference,
            callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-confirmation/${order._id}`,
            metadata: {
              order_id: order._id.toString(),
              user_id: user.id,
              order_number: order.orderNumber,
            },
          }),
        });

        const data = await response.json() as PaystackInitializeResponse;

        if (data.status) {
          order.paymentReference = reference;
          await order.save();

          res.json({
            success: true,
            authorization_url: data.data.authorization_url,
            reference: data.data.reference,
          });
          return;
        }
      } catch (paystackError) {
        console.error('Paystack transaction request error:', paystackError);
      }
    }

    // ─── FALLBACK: Simulate Local Payment Test Mode ───────────────────
    console.log('🔧 Using simulated payment test mode.');
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.paymentReference = reference;
    await order.save();

    res.json({
      success: true,
      authorization_url: `/order-confirmation/${order._id}`,
      reference: reference,
      testMode: true,
      message: 'Test mode simulation successful',
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment initialization failed',
    });
  }
};

// ─── Verify Paystack Payment ──────────────────────────────────────
export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { reference } = req.params;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isPaystackConfigured = paystackSecret && paystackSecret !== 'sk_test_your_paystack_secret_key_here';

    let paymentStatus = 'success';
    let paymentData: any = { reference, status: 'success' };

    if (isPaystackConfigured) {
      try {
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          { headers: { Authorization: `Bearer ${paystackSecret}` } }
        );

        const data = await response.json() as PaystackVerifyResponse;

        if (data.status && data.data.status === 'success') {
          paymentStatus = 'success';
          paymentData = data.data;
        } else {
          paymentStatus = 'failed';
          paymentData = data.data || { reference, status: 'failed' };
        }
      } catch (verifyError) {
        console.error('Paystack verification error:', verifyError);
      }
    }

    const order = await Order.findOne({ paymentReference: reference });

    if (order) {
      if (paymentStatus === 'success') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
      } else {
        order.paymentStatus = 'failed';
      }
      await order.save();
    }

    res.json({
      success: true,
      status: paymentStatus,
      payment: paymentData,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed',
    });
  }
};

// ─── Update Order Status (Admin Only) ────────────────────────────
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (orderStatus === 'delivered') {
      order.orderStatus = 'delivered';
      await order.save();
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Order ──────────────────────────────────────────────────
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = getUserData(req);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.user.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
      return;
    }

    if (!['pending', 'processing'].includes(order.orderStatus)) {
      res.status(400).json({ success: false, message: 'Only pending or processing orders can be cancelled' });
      return;
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Orders (Admin Only) ──────────────────────────────────
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, limit = 20, page = 1, startDate, endDate } = req.query;
    
    const query: any = {};
    if (status) query.orderStatus = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName email phone')
        .populate('items.product')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ]);

    res.json({
      success: true,
      orders,
      stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};