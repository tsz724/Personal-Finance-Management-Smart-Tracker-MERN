const CalendarEvent = require('../models/CalendarEvent');
const { findWorkspaceForUser, workspaceIdsForUser } = require('../utils/workspaceHelper');

exports.listEvents = async (req, res) => {
    try {
        const { from, to, workspaceId, scope = 'all' } = req.query;
        const userId = req.user.id;
        const startFilter = from ? new Date(from) : new Date();
        const endFilter = to ? new Date(to) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

        const inWindow = {
            start: { $lte: endFilter },
            end: { $gte: startFilter },
        };

        let filter;
        if (scope === 'personal' || !workspaceId) {
            const wsIds = await workspaceIdsForUser(userId);
            filter = {
                $and: [
                    inWindow,
                    {
                        $or: [
                            { organizer: userId, visibility: 'personal' },
                            { organizer: userId, visibility: 'workspace' },
                            { attendees: userId },
                            { workspace: { $in: wsIds }, visibility: 'workspace' },
                        ],
                    },
                ],
            };
        } else {
            const ctx = await findWorkspaceForUser(workspaceId, userId);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            filter = {
                $and: [
                    inWindow,
                    {
                        $or: [{ workspace: workspaceId, visibility: 'workspace' }, { organizer: userId }],
                    },
                ],
            };
        }

        const events = await CalendarEvent.find(filter)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email')
            .populate('workspace', 'name color')
            .sort({ start: 1 });
        res.json(events);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            start,
            end,
            allDay,
            attendees,
            location,
            workspaceId,
            visibility,
            eventType,
        } = req.body;
        if (!title || !start || !end) {
            return res.status(400).json({ message: 'title, start, and end are required' });
        }
        const doc = {
            title: title.trim(),
            description: description || '',
            start: new Date(start),
            end: new Date(end),
            allDay: !!allDay,
            organizer: req.user.id,
            attendees: Array.isArray(attendees) ? attendees : [],
            location: location || '',
            visibility: visibility || 'personal',
            eventType: eventType || 'meeting',
            workspace: null,
        };
        if (workspaceId) {
            const ctx = await findWorkspaceForUser(workspaceId, req.user.id);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            doc.workspace = workspaceId;
            if (doc.visibility === 'workspace') {
                /* ok */
            }
        }
        const ev = await CalendarEvent.create(doc);
        const out = await CalendarEvent.findById(ev._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email')
            .populate('workspace', 'name color');
        res.status(201).json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const ev = await CalendarEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        if (ev.organizer.toString() !== req.user.id.toString() && (req.user.role || 'employee') !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        const fields = ['title', 'description', 'start', 'end', 'allDay', 'attendees', 'location', 'visibility', 'eventType', 'workspace'];
        for (const f of fields) {
            if (req.body[f] !== undefined) {
                if (f === 'start' || f === 'end') ev[f] = new Date(req.body[f]);
                else if (f === 'allDay') ev.allDay = !!req.body[f];
                else if (f === 'attendees') ev.attendees = Array.isArray(req.body[f]) ? req.body[f] : [];
                else if (f === 'title') ev.title = String(req.body[f]).trim();
                else if (f === 'workspace') {
                    if (req.body[f]) {
                        const ctx = await findWorkspaceForUser(req.body[f], req.user.id);
                        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
                        ev.workspace = req.body[f];
                    } else {
                        ev.workspace = null;
                    }
                } else ev[f] = req.body[f];
            }
        }
        await ev.save();
        const out = await CalendarEvent.findById(ev._id)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email')
            .populate('workspace', 'name color');
        res.json(out);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const ev = await CalendarEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        if (ev.organizer.toString() !== req.user.id.toString() && (req.user.role || 'employee') !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        await CalendarEvent.deleteOne({ _id: ev._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
