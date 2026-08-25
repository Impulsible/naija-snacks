import express, { RequestHandler } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  initializePayment,
  verifyPayment,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// ─── Protected Routes ──────────────────────────────────────────────
router.use(protect as RequestHandler);

// User Order Management
router.post('/', createOrder as unknown as RequestHandler);
router.get('/', getUserOrders as unknown as RequestHandler);
router.get('/my-orders', getUserOrders as unknown as RequestHandler);
router.get('/:id', getOrderById as unknown as RequestHandler);
router.post('/:orderId/pay', initializePayment as unknown as RequestHandler);
router.put('/:id/cancel', cancelOrder as unknown as RequestHandler);

// Verification routes
router.get('/verify-payment/:reference', verifyPayment as unknown as RequestHandler);
router.post('/verify-payment/:reference', verifyPayment as unknown as RequestHandler);

// Admin Order Management
router.get('/admin/all', authorize('admin') as RequestHandler, getAllOrders as unknown as RequestHandler);
router.put('/:id/status', authorize('admin') as RequestHandler, updateOrderStatus as unknown as RequestHandler);

export default router;