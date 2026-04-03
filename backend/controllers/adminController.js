const User = require('../models/Users');

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(500);
        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'manager', 'employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user._id.toString() === req.user.id.toString() && role !== 'admin') {
            /* allow demoting self? block for safety */
        }
        user.role = role;
        await user.save();
        const out = await User.findById(user._id).select('-password');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setUserActive = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive boolean required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user._id.toString() === req.user.id.toString() && isActive === false) {
            return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }
        user.isActive = isActive;
        await user.save();
        const out = await User.findById(user._id).select('-password');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.stats = async (req, res) => {
    try {
        const UserModel = User;
        const Workspace = require('../models/Workspace');
        const Job = require('../models/Job');
        const WorkItem = require('../models/WorkItem');
        const [users, workspaces, jobsOpen, workOpen] = await Promise.all([
            UserModel.countDocuments({ isActive: true }),
            Workspace.countDocuments(),
            Job.countDocuments({ status: { $nin: ['done', 'cancelled'] } }),
            WorkItem.countDocuments({ status: { $ne: 'done' } }),
        ]);
        res.json({
            activeUsers: users,
            workspaces,
            openJobs: jobsOpen,
            openWorkItems: workOpen,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
