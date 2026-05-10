import mongoose, { Schema, Document } from 'mongoose';

export interface IRule extends Document {
  ruleId: string;
  category: string;
  description: string;
  votes: number;
  maxVotes: number;
  houseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RuleSchema: Schema = new Schema({
  ruleId: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  votes: { type: Number, default: 1 },
  maxVotes: { type: Number, required: true },
  houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rule || mongoose.model<IRule>('Rule', RuleSchema);
