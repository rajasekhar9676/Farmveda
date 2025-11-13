import mongoose, { Schema, Document, Model } from 'mongoose';
import { User, Address } from '@/lib/types';

export interface IUser extends Document, Omit<User, 'id'> {
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

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  address: { 
    type: AddressSchema, 
    default: () => ({
      communityName: '',
      apartmentName: '',
      roomNo: '',
      street: '',
      city: '',
      pincode: '',
    })
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// Prevent re-compilation during development
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;

