const Project = require('../models/Project');
const { findWorkspaceForUser } = require('../utils/workspaceHelper');

exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('lead', 'name email')
            .populate('createdBy', 'name email');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        const ctx = await findWorkspaceForUser(project.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });
        res.json(project);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listProjects = async (req, res) => {
    try {
        const { workspaceId } = req.query;
        if (!workspaceId) {
            return res.status(400).json({ message: 'workspaceId query required' });
        }
        const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
        const projects = await Project.find({ workspace: workspaceId })
            .populate('lead', 'name email')
            .populate('createdBy', 'name email')
            .sort({ name: 1 });
        res.json(projects);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { workspaceId, name, key, description, lead } = req.body;
        if (!workspaceId || !name || !key) {
            return res.status(400).json({ message: 'workspaceId, name, and key are required' });
        }
        const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });

        const k = String(key).trim().toUpperCase();
        const project = await Project.create({
            workspace: workspaceId,
            name: name.trim(),
            key: k,
            description: description || '',
            lead: lead || null,
            createdBy: req.user.id,
        });
        const out = await Project.findById(project._id)
            .populate('lead', 'name email')
            .populate('createdBy', 'name email');
        res.status(201).json(out);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: 'Project key must be unique in this workspace' });
        }
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        const ctx = await findWorkspaceForUser(project.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });

        const { name, description, lead } = req.body;
        if (name != null) project.name = String(name).trim();
        if (description != null) project.description = description;
        if (lead !== undefined) project.lead = lead || null;
        await project.save();

        const out = await Project.findById(project._id)
            .populate('lead', 'name email')
            .populate('createdBy', 'name email');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        const ctx = await findWorkspaceForUser(project.workspace, req.user.id);
        if (!ctx) return res.status(403).json({ message: 'Not allowed' });
        const WorkItem = require('../models/WorkItem');
        await WorkItem.deleteMany({ project: project._id });
        await Project.deleteOne({ _id: project._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
