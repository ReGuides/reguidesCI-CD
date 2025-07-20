import mongoose from 'mongoose';

export interface IFriend extends mongoose.Document {
  id: string;
  name: string;
  url: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

const friendSchema = new mongoose.Schema<IFriend>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  logo: { type: String, required: true }
}, {
  timestamps: true
});

export const FriendModel = mongoose.models.Friend || mongoose.model<IFriend>('Friend', friendSchema); 