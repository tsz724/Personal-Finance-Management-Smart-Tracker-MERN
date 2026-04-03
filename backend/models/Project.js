const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        name: { type: String, required: true, trim: true },
        key: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            minlength: 2,
            maxlength: 8,
        },
        description: { type: String, default: '' },
        lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

projectSchema.index({ workspace: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
