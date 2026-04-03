const { Types } = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Job = require('../models/Job');
const WorkItem = require('../models/WorkItem');
const EmailMessage = require('../models/EmailMessage');
const CalendarEvent = require('../models/CalendarEvent');
const Workspace = require('../models/Workspace');
const User = require('../models/Users');
const Project = require('../models/Project');
const { workspaceIdsForUser } = require('../utils/workspaceHelper');
const dashboardController = require('./dashboardController');

async function financeSummary(userId) {
    const userObjectId = new Types.ObjectId(String(userId));
    const totalincome = await Income.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: null, totalIncome: { $sum: '$amount' } } },
    ]);
    const totalexpenses = await Expense.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);
    const ti = totalincome[0]?.totalIncome || 0;
    const te = totalexpenses[0]?.totalExpenses || 0;
    return {
        totalBalance: ti - te,
        totalincome: ti,
        totalexpenses: te,
    };
}

async function getFinanceDashboardJson(req) {
    return new Promise((resolve, reject) => {
        const res = {
            status(code) {
                this._code = code;
                return this;
            },
            json(data) {
                if (this._code && this._code >= 400) {
                    reject(new Error(data?.message || 'Dashboard error'));
                } else {
                    resolve(data);
                }
            },
        };
        dashboardController.getDashboardData(req, res);
    });
}

exports.getBusinessSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const scope =
            req.query.scope === 'organization' && (req.user.role || 'employee') === 'admin'
                ? 'organization'
                : 'personal';
        const wsIds = await workspaceIdsForUser(userId);
        const finance = await financeSummary(userId);

        const myOpenJobs = await Job.countDocuments({
            assignee: userId,
            status: { $nin: ['done', 'cancelled'] },
        });
        const workspaceJobOpen = await Job.countDocuments({
            workspace: { $in: wsIds },
            status: { $nin: ['done', 'cancelled'] },
        });

        const projectIds = await Project.find({ workspace: { $in: wsIds } }).distinct('_id');
        const myWorkOpen = await WorkItem.countDocuments({
            assignee: userId,
            status: { $ne: 'done' },
        });
        const workspaceWorkOpen = await WorkItem.countDocuments({
            project: { $in: projectIds },
            status: { $ne: 'done' },
        });

        const unreadEmail = await EmailMessage.countDocuments({ owner: userId, folder: 'inbox', read: false });

        const soon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const upcomingEvents = await CalendarEvent.find({
            start: { $gte: new Date(), $lte: soon },
            $or: [{ organizer: userId }, { attendees: userId }],
        })
            .sort({ start: 1 })
            .limit(10)
            .select('title start end location eventType')
            .lean();

        const payload = {
            scope,
            finance,
            jobs: {
                myOpen: myOpenJobs,
                workspaceOpen: workspaceJobOpen,
            },
            workItems: {
                myOpen: myWorkOpen,
                workspaceOpen: workspaceWorkOpen,
            },
            unreadEmail,
            upcomingEvents,
            workspaces: wsIds.length,
        };

        if (scope === 'organization') {
            payload.organization = {
                totalUsers: await User.countDocuments({ isActive: true }),
                totalWorkspaces: await Workspace.countDocuments(),
                usersByRole: await User.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$role', count: { $sum: 1 } } },
                ]),
            };
        }

        res.json(payload);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

/** Finance charts (existing dashboard) + business KPIs for admin/personal */
exports.getFullDashboard = async (req, res) => {
    try {
        const financeDetail = await getFinanceDashboardJson(req);
        const userId = req.user.id;
        const scope =
            req.query.scope === 'organization' && (req.user.role || 'employee') === 'admin'
                ? 'organization'
                : 'personal';
        const wsIds = await workspaceIdsForUser(userId);

        const business = {
            scope,
            jobs: {
                myOpen: await Job.countDocuments({
                    assignee: userId,
                    status: { $nin: ['done', 'cancelled'] },
                }),
                workspaceOpen: await Job.countDocuments({
                    workspace: { $in: wsIds },
                    status: { $nin: ['done', 'cancelled'] },
                }),
            },
            workItems: {
                myOpen: await WorkItem.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
            },
            unreadEmail: await EmailMessage.countDocuments({ owner: userId, folder: 'inbox', read: false }),
            workspaces: wsIds.length,
        };

        if (scope === 'organization') {
            business.organization = {
                totalUsers: await User.countDocuments({ isActive: true }),
                totalWorkspaces: await Workspace.countDocuments(),
                usersByRole: await User.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$role', count: { $sum: 1 } } },
                ]),
            };
        }

        res.json({
            ...financeDetail,
            business,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
