const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        employeeCode: { type: String, trim: true, default: '' },
        department: { type: String, trim: true, default: '' },
        position: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        hireDate: { type: Date, default: null },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

employeeProfileSchema.index({ workspace: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
