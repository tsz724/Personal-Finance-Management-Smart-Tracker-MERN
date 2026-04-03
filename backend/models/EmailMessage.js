const mongoose = require('mongoose');

const emailMessageSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        folder: {
            type: String,
            enum: ['inbox', 'sent', 'drafts', 'trash'],
            default: 'inbox',
        },
        from: { type: String, required: true, trim: true },
        to: [{ type: String, trim: true }],
        cc: [{ type: String, trim: true }],
        subject: { type: String, default: '(no subject)' },
        body: { type: String, default: '' },
        read: { type: Boolean, default: false },
        starred: { type: Boolean, default: false },
        workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
    },
    { timestamps: true }
);

emailMessageSchema.index({ owner: 1, folder: 1, createdAt: -1 });

module.exports = mongoose.model('EmailMessage', emailMessageSchema);
