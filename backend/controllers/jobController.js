const Job = require('../models/Job');
const { findWorkspaceForUser, workspaceIdsForUser } = require('../utils/workspaceHelper');

exports.listJobs = async (req, res) => {
    try {
        const { workspaceId, status, mine } = req.query;
        const userId = req.user.id;
        let filter = {};

        if (workspaceId) {
            const ctx = await findWorkspaceForUser(workspaceId, userId);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            filter.workspace = workspaceId;
        } else {
            const ids = await workspaceIdsForUser(userId);
            filter.workspace = { $in: ids };
        }

        if (status) filter.status = status;
        if (mine === 'true') filter.assignee = userId;

        const jobs = await Job.find(filter)
            .populate('assignee', 'name email')
            .populate('createdBy', 'name email')
            .populate('workspace', 'name color')
            .sort({ updatedAt: -1 });
        res.json(jobs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { workspaceId, title, description, status, priority, assignee, dueDate, tags } = req.body;
        if (!workspaceId || !title) {
            return res.status(400).json({ message: 'workspaceId and title are required' });
        }
        const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });

        const job = await Job.create({
            workspace: workspaceId,
            title: title.trim(),
            description: description || '',
            status: status || 'open',
            priority: priority || 'medium',
            assignee: assignee || null,
            createdBy: req.user.id,
            dueDate: dueDate ? new Date(dueDate) : null,
            tags: Array.isArray(tags) ? tags : [],
        });
        const out = await Job.findById(job._id)
            .populate('assignee', 'name email')
            .populate('createdBy', 'name email')
            .populate('workspace', 'name color');
        res.status(201).json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const ctx = await findWorkspaceForUser(job.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });

        const { title, description, status, priority, assignee, dueDate, tags } = req.body;
        if (title != null) job.title = String(title).trim();
        if (description != null) job.description = description;
        if (status != null) job.status = status;
        if (priority != null) job.priority = priority;
        if (assignee !== undefined) job.assignee = assignee || null;
        if (dueDate !== undefined) job.dueDate = dueDate ? new Date(dueDate) : null;
        if (tags != null) job.tags = Array.isArray(tags) ? tags : [];
        await job.save();

        const out = await Job.findById(job._id)
            .populate('assignee', 'name email')
            .populate('createdBy', 'name email')
            .populate('workspace', 'name color');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        const ctx = await findWorkspaceForUser(job.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });
        await Job.deleteOne({ _id: job._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
