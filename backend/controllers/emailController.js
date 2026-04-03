const EmailMessage = require('../models/EmailMessage');
const { findWorkspaceForUser } = require('../utils/workspaceHelper');

exports.listEmails = async (req, res) => {
    try {
        const { folder = 'inbox', workspaceId } = req.query;
        const filter = { owner: req.user.id, folder };
        if (workspaceId) {
            const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            filter.workspace = workspaceId;
        }
        const list = await EmailMessage.find(filter).sort({ createdAt: -1 }).limit(200);
        res.json(list);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createEmail = async (req, res) => {
    try {
        const { folder, from, to, cc, subject, body, workspaceId, read, starred } = req.body;
        const doc = {
            owner: req.user.id,
            folder: folder || 'drafts',
            from: from || req.user.email,
            to: Array.isArray(to) ? to : [],
            cc: Array.isArray(cc) ? cc : [],
            subject: subject || '(no subject)',
            body: body || '',
            read: !!read,
            starred: !!starred,
        };
        if (workspaceId) {
            const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            doc.workspace = workspaceId;
        }
        const msg = await EmailMessage.create(doc);
        res.status(201).json(msg);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEmail = async (req, res) => {
    try {
        const msg = await EmailMessage.findOne({ _id: req.params.id, owner: req.user.id });
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        const { folder, read, starred, subject, body } = req.body;
        if (folder != null) msg.folder = folder;
        if (read != null) msg.read = !!read;
        if (starred != null) msg.starred = !!starred;
        if (subject != null) msg.subject = subject;
        if (body != null) msg.body = body;
        await msg.save();
        res.json(msg);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEmail = async (req, res) => {
    try {
        const r = await EmailMessage.deleteOne({ _id: req.params.id, owner: req.user.id });
        if (!r.deletedCount) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.unreadCount = async (req, res) => {
    try {
        const count = await EmailMessage.countDocuments({ owner: req.user.id, folder: 'inbox', read: false });
        res.json({ count });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
