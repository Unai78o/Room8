import mongoose, { Schema, Document } from 'mongoose';


export interface IHouse extends Document {
  name: string;
  address: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const HouseSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, default: "" },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.House || mongoose.model<IHouse>('House', HouseSchema);
