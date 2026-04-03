const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'blocked', 'done', 'cancelled'],
            default: 'open',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        dueDate: { type: Date, default: null },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

jobSchema.index({ workspace: 1, status: 1 });
jobSchema.index({ assignee: 1 });

module.exports = mongoose.model('Job', jobSchema);
