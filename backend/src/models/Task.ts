import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  pinned: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  tags: string[];
  userId: string;
}

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  completed: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  userId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, pinned: -1, createdAt: -1 });
TaskSchema.index({ userId: 1, completed: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

export default model<ITask>('Task', TaskSchema);