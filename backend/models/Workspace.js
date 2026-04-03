const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member',
        },
    },
    { _id: false }
);

const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        color: { type: String, default: '#6366f1' },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: [memberSchema],
    },
    { timestamps: true }
);

workspaceSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
