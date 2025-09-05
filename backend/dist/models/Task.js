"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)('Task', TaskSchema);
