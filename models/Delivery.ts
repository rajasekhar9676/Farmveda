import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DeliveryItem {
  productId: string;
  productName: string;
  price: number; // Price for this delivery (can be different from original)
  quantity: number; // Available quantity for this delivery
  unit: 'kilo' | 'pieces' | 'boxes';
  description?: string;
  image?: string;
}

export interface IDelivery extends Document {
  deliveryDate: string; // YYYY-MM-DD format
  products: DeliveryItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

const DeliveryItemSchema = new Schema<DeliveryItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kilo', 'pieces', 'boxes'], required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
}, { _id: false });

const DeliverySchema = new Schema<IDelivery>({
  deliveryDate: { type: String, required: true, index: true },
  products: { type: [DeliveryItemSchema], required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true,
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const DeliveryModel: Model<IDelivery> = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);

export default DeliveryModel;

