const WorkItem = require('../models/WorkItem');
const Project = require('../models/Project');
const { findWorkspaceForUser } = require('../utils/workspaceHelper');

async function assertProjectAccess(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) return null;
    const ctx = await findWorkspaceForUser(project.workspace, userId);
    if (!ctx) return null;
    return project;
}

exports.listWorkItems = async (req, res) => {
    try {
        const { projectId, status } = req.query;
        if (!projectId) {
            return res.status(400).json({ message: 'projectId query required' });
        }
        const project = await assertProjectAccess(projectId, req.user.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        const filter = { project: projectId };
        if (status) filter.status = status;
        const items = await WorkItem.find(filter)
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .sort({ status: 1, order: 1, createdAt: 1 });
        res.json(items);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createWorkItem = async (req, res) => {
    try {
        const {
            projectId,
            title,
            description,
            type,
            status,
            priority,
            assignee,
            sprint,
            labels,
            storyPoints,
        } = req.body;
        if (!projectId || !title) {
            return res.status(400).json({ message: 'projectId and title are required' });
        }
        const project = await assertProjectAccess(projectId, req.user.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const maxOrder = await WorkItem.findOne({ project: projectId, status: status || 'backlog' })
            .sort({ order: -1 })
            .select('order')
            .lean();
        const order = (maxOrder?.order ?? -1) + 1;

        const item = await WorkItem.create({
            project: projectId,
            title: title.trim(),
            description: description || '',
            type: type || 'task',
            status: status || 'backlog',
            priority: priority || 'medium',
            assignee: assignee || null,
            reporter: req.user.id,
            sprint: sprint || '',
            labels: Array.isArray(labels) ? labels : [],
            storyPoints: storyPoints != null ? Number(storyPoints) : null,
            order,
        });
        const out = await WorkItem.findById(item._id)
            .populate('assignee', 'name email')
            .populate('reporter', 'name email');
        res.status(201).json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateWorkItem = async (req, res) => {
    try {
        const item = await WorkItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Work item not found' });
        const project = await assertProjectAccess(item.project, req.user.id);
        if (!project) return res.status(403).json({ message: 'Not allowed' });

        const fields = [
            'title',
            'description',
            'type',
            'status',
            'priority',
            'assignee',
            'sprint',
            'labels',
            'storyPoints',
            'order',
        ];
        for (const f of fields) {
            if (req.body[f] !== undefined) {
                if (f === 'assignee') item.assignee = req.body[f] || null;
                else if (f === 'order') item.order = Number(req.body[f]) || 0;
                else if (f === 'storyPoints') item.storyPoints = req.body[f] != null ? Number(req.body[f]) : null;
                else if (f === 'labels') item.labels = Array.isArray(req.body[f]) ? req.body[f] : [];
                else if (f === 'title') item.title = String(req.body[f]).trim();
                else item[f] = req.body[f];
            }
        }
        await item.save();
        const out = await WorkItem.findById(item._id)
            .populate('assignee', 'name email')
            .populate('reporter', 'name email');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteWorkItem = async (req, res) => {
    try {
        const item = await WorkItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Work item not found' });
        const project = await assertProjectAccess(item.project, req.user.id);
        if (!project) return res.status(403).json({ message: 'Not allowed' });
        await WorkItem.deleteOne({ _id: item._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
