import mongoose, { Schema, Document, Model } from 'mongoose';
import { Product } from '@/lib/types';

export interface IProduct extends Document, Omit<Product, 'id'> {
  _id: string;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, enum: ['kilo', 'pieces', 'boxes'], required: true },
  availableDate: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const ProductModel: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;

