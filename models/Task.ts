import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  assignedTo?: mongoose.Types.ObjectId;
  xpReward: number;
  houseId: mongoose.Types.ObjectId;
  completed: boolean;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  xpReward: { type: Number, required: true },
  houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
