const Workspace = require('../models/Workspace');
const { findWorkspaceForUser, workspaceIdsForUser, memberRole } = require('../utils/workspaceHelper');

function ensureOwnerOrWorkspaceAdmin(ws, userId) {
    const role = memberRole(ws, userId);
    return role === 'owner' || role === 'admin';
}

exports.listWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;
        const ids = await workspaceIdsForUser(userId);
        const list = await Workspace.find({ _id: { $in: ids } })
            .populate('owner', 'name email')
            .sort({ updatedAt: -1 });
        res.json(list);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createWorkspace = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const ws = await Workspace.create({
            name: name.trim(),
            description: description || '',
            color: color || '#6366f1',
            owner: req.user.id,
            members: [{ user: req.user.id, role: 'owner' }],
        });
        const populated = await Workspace.findById(ws._id).populate('owner', 'name email');
        res.status(201).json(populated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getWorkspace = async (req, res) => {
    try {
        const ctx = await findWorkspaceForUser(req.params.id, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        const ws = await populateWorkspace(ctx.workspace._id);
        res.json(ws);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

async function populateWorkspace(id) {
    return Workspace.findById(id)
        .populate('owner', 'name email role')
        .populate('members.user', 'name email role jobTitle department');
}

exports.updateWorkspace = async (req, res) => {
    try {
        const ctx = await findWorkspaceForUser(req.params.id, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        if (!ensureOwnerOrWorkspaceAdmin(ctx.workspace, req.user.id)) {
            return res.status(403).json({ message: 'Not allowed to update this workspace' });
        }
        const { name, description, color } = req.body;
        const ws = ctx.workspace;
        if (name != null) ws.name = String(name).trim();
        if (description != null) ws.description = description;
        if (color != null) ws.color = color;
        await ws.save();
        res.json(await populateWorkspace(ws._id));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteWorkspace = async (req, res) => {
    try {
        const ctx = await findWorkspaceForUser(req.params.id, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        if (ctx.workspace.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete the workspace' });
        }
        await Workspace.deleteOne({ _id: ctx.workspace._id });
        res.json({ message: 'Workspace deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const ctx = await findWorkspaceForUser(req.params.id, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        if (!ensureOwnerOrWorkspaceAdmin(ctx.workspace, req.user.id)) {
            return res.status(403).json({ message: 'Not allowed' });
        }
        const { userId, email, role = 'member' } = req.body;
        const User = require('../models/Users');
        let memberUserId = userId;
        if (!memberUserId && email) {
            const u = await User.findOne({ email: String(email).trim().toLowerCase() });
            if (!u) return res.status(404).json({ message: 'No user with that email' });
            memberUserId = u._id;
        }
        if (!memberUserId) return res.status(400).json({ message: 'userId or email required' });
        const u = await User.findById(memberUserId);
        if (!u) return res.status(404).json({ message: 'User not found' });
        const ws = ctx.workspace;
        const exists = ws.members.some((m) => m.user.toString() === memberUserId.toString());
        if (!exists) {
            ws.members.push({ user: memberUserId, role: role === 'admin' ? 'admin' : 'member' });
            await ws.save();
        }
        res.json(await populateWorkspace(ws._id));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const ctx = await findWorkspaceForUser(req.params.id, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        if (!ensureOwnerOrWorkspaceAdmin(ctx.workspace, req.user.id)) {
            return res.status(403).json({ message: 'Not allowed' });
        }
        const { userId } = req.params;
        if (ctx.workspace.owner.toString() === userId.toString()) {
            return res.status(400).json({ message: 'Cannot remove workspace owner' });
        }
        ctx.workspace.members = ctx.workspace.members.filter((m) => m.user.toString() !== userId.toString());
        await ctx.workspace.save();
        res.json(await populateWorkspace(ctx.workspace._id));
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
