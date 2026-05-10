import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  alias: string;
  email: string;
  passwordHash: string;
  xp: number;
  houseId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  alias: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  xp: { type: Number, default: 0 },
  houseId: { type: Schema.Types.ObjectId, ref: 'House', required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
