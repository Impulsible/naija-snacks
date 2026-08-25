import api from './api';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  phone: string;
  additionalInfo?: string;
}

export interface OrderData {
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'paystack' | 'cash_on_delivery';
  notes?: string;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  items: OrderData['items'];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  orderStatus: string;
  createdAt: string;
  updatedAt?: string;
  user?: string | {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderResponse {
  success: boolean;
  order: Order;
}

export const orderService = {
  async createOrder(data: OrderData): Promise<Order> {
    const response = await api.post<OrderResponse>('/orders', data);
    return response.data.order;
  },

  async getUserOrders(): Promise<Order[]> {
    const response = await api.get<OrdersResponse>('/orders');
    return response.data.orders;
  },

  async getAdminOrders(status?: string): Promise<Order[]> {
    const url = status ? `/orders/admin/all?status=${status}` : '/orders/admin/all';
    const response = await api.get<OrdersResponse>(url);
    return response.data.orders;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<OrderResponse>(`/orders/${id}`);
    return response.data.order;
  },

  async initializePayment(orderId: string): Promise<{ authorization_url: string; reference: string }> {
    const response = await api.post<{ success: boolean; authorization_url: string; reference: string }>(
      `/orders/${orderId}/pay`
    );
    return {
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    };
  },

  async verifyPayment(reference: string): Promise<any> {
    const response = await api.post(`/orders/verify-payment/${reference}`);
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.put<OrderResponse>(`/orders/${orderId}/cancel`);
    return response.data.order;
  },

  async updateOrderStatus(orderId: string, orderStatus: string): Promise<Order> {
    const response = await api.put<OrderResponse>(
      `/orders/${orderId}/status`,
      { orderStatus }
    );
    return response.data.order;
  },

  async deleteOrder(orderId: string): Promise<void> {
    await api.delete(`/orders/${orderId}`);
  },
};