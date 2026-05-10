import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  concept: string;
  total: number;
  paid: number;
  houseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BillSchema: Schema = new Schema({
  concept: { type: String, required: true },
  total: { type: Number, required: true },
  paid: { type: Number, default: 0 },
  houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
