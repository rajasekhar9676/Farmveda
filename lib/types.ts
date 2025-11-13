export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: UserRole;
  address?: Address;
  createdAt: string;
}

export interface Address {
  communityName: string;
  apartmentName: string;
  roomNo: string;
  street?: string;
  city?: string;
  pincode?: string;
}

export type ProductUnit = 'kilo' | 'pieces' | 'boxes';

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: ProductUnit;
  availableDate: string; // YYYY-MM-DD format
  description?: string;
  image?: string; // Image URL or base64
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'paid' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: Address;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryDate: string;
  paymentLink?: string;
  paymentQRCode?: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface DeliveryItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: ProductUnit;
  description?: string;
  image?: string;
}

export interface Delivery {
  id: string;
  deliveryDate: string;
  products: DeliveryItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

