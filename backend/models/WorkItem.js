const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        type: {
            type: String,
            enum: ['task', 'bug', 'story', 'epic'],
            default: 'task',
        },
        status: {
            type: String,
            enum: ['backlog', 'todo', 'in_progress', 'review', 'done'],
            default: 'backlog',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sprint: { type: String, default: '' },
        order: { type: Number, default: 0 },
        labels: [{ type: String, trim: true }],
        storyPoints: { type: Number, default: null },
    },
    { timestamps: true }
);

workItemSchema.index({ project: 1, status: 1, order: 1 });

module.exports = mongoose.model('WorkItem', workItemSchema);
