import mongoose, { Schema, Document, Model } from 'mongoose';
import { Order, OrderItem, Address } from '@/lib/types';

export interface IOrder extends Document, Omit<Order, 'id'> {
  _id: string;
}

const AddressSchema = new Schema<Address>({
  communityName: { type: String, default: '' },
  apartmentName: { type: String, default: '' },
  roomNo: { type: String, default: '' },
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
}, { _id: false });

const OrderItemSchema = new Schema<OrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kilo', 'pieces', 'boxes'], required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerAddress: { type: AddressSchema, required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'paid', 'cancelled'],
    default: 'pending',
    index: true,
  },
  deliveryDate: { type: String, required: true, index: true },
  paymentLink: { type: String, default: '' },
  paymentQRCode: { type: String, default: '' },
  paidAt: { type: String, default: '' },
  deliveredAt: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const OrderModel: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;

