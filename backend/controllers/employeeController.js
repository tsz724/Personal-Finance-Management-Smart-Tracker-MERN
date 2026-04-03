const EmployeeProfile = require('../models/EmployeeProfile');
const { findWorkspaceForUser, memberRole } = require('../utils/workspaceHelper');

exports.listEmployees = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) return res.status(400).json({ message: 'workspaceId required' });
        const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        const list = await EmployeeProfile.find({ workspace: workspaceId })
            .populate('user', 'name email role jobTitle department')
            .populate('manager', 'name email')
            .sort({ department: 1, position: 1 });
        res.json(list);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.upsertEmployee = async (req, res) => {
    try {
        const {
            workspaceId,
            userId: bodyUserId,
            email,
            employeeCode,
            department,
            position,
            phone,
            manager,
            hireDate,
            notes,
        } = req.body;
        let userId = bodyUserId;
        if (!userId && email) {
            const User = require('../models/Users');
            const u = await User.findOne({ email: String(email).trim().toLowerCase() });
            if (!u) return res.status(404).json({ message: 'No user with that email' });
            userId = u._id;
        }
        if (!workspaceId || !userId) {
            return res.status(400).json({ message: 'workspaceId and (userId or email) required' });
        }
        const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        const r = memberRole(ctx.workspace, req.user.id);
        if (r !== 'owner' && r !== 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only workspace admins can manage employee records' });
        }

        const existing = await EmployeeProfile.findOne({ workspace: workspaceId, user: userId });
        const isCreate = !existing;
        let profile = existing || new EmployeeProfile({ workspace: workspaceId, user: userId });
        if (employeeCode != null) profile.employeeCode = employeeCode;
        if (department != null) profile.department = department;
        if (position != null) profile.position = position;
        if (phone != null) profile.phone = phone;
        if (manager !== undefined) profile.manager = manager || null;
        if (hireDate !== undefined) profile.hireDate = hireDate ? new Date(hireDate) : null;
        if (notes != null) profile.notes = notes;
        await profile.save();

        const out = await EmployeeProfile.findById(profile._id)
            .populate('user', 'name email role jobTitle department')
            .populate('manager', 'name email');
        res.status(isCreate ? 201 : 200).json(out);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: 'Employee profile already exists for this user in workspace' });
        }
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const profile = await EmployeeProfile.findById(req.params.id);
        if (!profile) return res.status(404).json({ message: 'Not found' });
        const ctx = await findWorkspaceForUser(profile.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });
        const r = memberRole(ctx.workspace, req.user.id);
        if (r !== 'owner' && r !== 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        await EmployeeProfile.deleteOne({ _id: profile._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
