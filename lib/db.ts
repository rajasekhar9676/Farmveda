import connectDB from './mongodb';
import UserModel from '@/models/User';
import ProductModel from '@/models/Product';
import OrderModel from '@/models/Order';
import { User, Product, Order } from './types';
import bcrypt from 'bcryptjs';

// Helper function to convert date to ISO string
function toISOString(date: any): string {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return new Date(date).toISOString();
  return new Date(date).toISOString();
}

// Initialize database connection
export async function initDB() {
  await connectDB();
}

// User functions
export async function readUsers(): Promise<User[]> {
  await connectDB();
  const users = await UserModel.find({}).lean();
  return users.map(user => ({
    id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || '',
    password: user.password,
    role: user.role,
    address: user.address,
    createdAt: toISOString(user.createdAt),
  }));
}

export async function writeUsers(users: User[]): Promise<void> {
  await connectDB();
  // This is mainly for migration, use individual create/update in production
  for (const user of users) {
    await UserModel.findOneAndUpdate(
      { _id: user.id },
      { $set: user },
      { upsert: true, new: true }
    );
  }
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  try {
    await connectDB();
    
    // Ensure address has default values if not provided
    const userDataWithDefaults = {
      ...userData,
      address: userData.address || {
        communityName: '',
        apartmentName: '',
        roomNo: '',
        street: '',
        city: '',
        pincode: '',
      },
      email: userData.email || '',
    };
    
    const user = new UserModel(userDataWithDefaults);
    await user.save();
    return {
      id: user._id.toString(),
      name: user.name,
      mobile: user.mobile,
      email: user.email || '',
      password: user.password,
      role: user.role,
      address: user.address || {
        communityName: '',
        apartmentName: '',
        roomNo: '',
        street: '',
        city: '',
        pincode: '',
      },
      createdAt: toISOString(user.createdAt),
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      throw new Error('Mobile number already registered');
    }
    throw error;
  }
}

export async function findUserByMobile(mobile: string): Promise<User | null> {
  await connectDB();
  const user = await UserModel.findOne({ mobile }).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || '',
    password: user.password,
    role: user.role,
    address: user.address,
    createdAt: toISOString(user.createdAt),
  };
}

export async function findUserById(id: string): Promise<User | null> {
  await connectDB();
  const user = await UserModel.findById(id).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || '',
    password: user.password,
    role: user.role,
    address: user.address,
    createdAt: toISOString(user.createdAt),
  };
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  await connectDB();
  const user = await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    mobile: user.mobile,
    email: user.email || '',
    password: user.password,
    role: user.role,
    address: user.address,
    createdAt: toISOString(user.createdAt),
  };
}

// Product functions
export async function readProducts(): Promise<Product[]> {
  await connectDB();
  const products = await ProductModel.find({}).lean();
  return products.map(product => ({
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    availableDate: product.availableDate,
    description: product.description || '',
    image: product.image || '',
    createdAt: toISOString(product.createdAt),
  }));
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  await connectDB();
  const product = new ProductModel(productData);
  await product.save();
  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    availableDate: product.availableDate,
    description: product.description || '',
    image: product.image || '',
    createdAt: toISOString(product.createdAt),
  };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  await connectDB();
  const product = await ProductModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!product) return null;
  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    availableDate: product.availableDate,
    description: product.description || '',
    image: product.image || '',
    createdAt: toISOString(product.createdAt),
  };
}

export async function findProductById(id: string): Promise<Product | null> {
  await connectDB();
  const product = await ProductModel.findById(id).lean();
  if (!product) return null;
  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    unit: product.unit,
    availableDate: product.availableDate,
    description: product.description || '',
    image: product.image || '',
    createdAt: toISOString(product.createdAt),
  };
}

// Order functions
export async function readOrders(): Promise<Order[]> {
  await connectDB();
  const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
  return orders.map(order => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    customerAddress: order.customerAddress,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryDate: order.deliveryDate,
    paymentLink: order.paymentLink || '',
    paymentQRCode: order.paymentQRCode || '',
    paidAt: order.paidAt || undefined,
    deliveredAt: order.deliveredAt || undefined,
    createdAt: order.createdAt || new Date().toISOString(),
  }));
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  await connectDB();
  const order = new OrderModel(orderData);
  await order.save();
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    customerAddress: order.customerAddress,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryDate: order.deliveryDate,
    paymentLink: order.paymentLink || '',
    paymentQRCode: order.paymentQRCode || '',
    paidAt: order.paidAt || undefined,
    deliveredAt: order.deliveredAt || undefined,
    createdAt: order.createdAt || new Date().toISOString(),
  };
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  await connectDB();
  const order = await OrderModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
  if (!order) return null;
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    customerAddress: order.customerAddress,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryDate: order.deliveryDate,
    paymentLink: order.paymentLink || '',
    paymentQRCode: order.paymentQRCode || '',
    paidAt: order.paidAt || undefined,
    deliveredAt: order.deliveredAt || undefined,
    createdAt: order.createdAt || new Date().toISOString(),
  };
}

export async function findOrderById(id: string): Promise<Order | null> {
  await connectDB();
  const order = await OrderModel.findById(id).lean();
  if (!order) return null;
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    customerAddress: order.customerAddress,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status,
    deliveryDate: order.deliveryDate,
    paymentLink: order.paymentLink || '',
    paymentQRCode: order.paymentQRCode || '',
    paidAt: order.paidAt || undefined,
    deliveredAt: order.deliveredAt || undefined,
    createdAt: order.createdAt || new Date().toISOString(),
  };
}

// Initialize default admin user
export async function initDefaultAdmin() {
  try {
    await connectDB();
    const adminExists = await UserModel.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await UserModel.create({
        name: 'Admin',
        mobile: '1234567890',
        email: 'admin@farmveda.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Default admin user created successfully');
      console.log('   Mobile: 1234567890');
      console.log('   Password: admin123');
      return admin;
    } else {
      console.log('✅ Admin user already exists');
      return adminExists;
    }
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}
