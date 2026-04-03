const CalendarEvent = require('../models/CalendarEvent');
const { findWorkspaceForUser, workspaceIdsForUser } = require('../utils/workspaceHelper');
const { expandRecurrence } = require('../utils/recurrenceExpand');

const RECURRING_PATTERNS = ['daily', 'weekly', 'monthly', 'yearly', 'weekdays'];

function baseCloneFields(plain) {
    return {
        title: plain.title,
        description: plain.description || '',
        organizer: plain.organizer,
        attendees: Array.isArray(plain.attendees) ? plain.attendees : [],
        guestEmails: Array.isArray(plain.guestEmails) ? plain.guestEmails : [],
        meetingLink: plain.meetingLink || '',
        eventColor: plain.eventColor || '',
        availability: plain.availability || 'busy',
        reminderMinutesBefore:
            typeof plain.reminderMinutesBefore === 'number' ? plain.reminderMinutesBefore : 30,
        location: plain.location || '',
        visibility: plain.visibility || 'personal',
        visibilityKind: plain.visibilityKind || 'default',
        eventType: plain.eventType || 'meeting',
        workspace: plain.workspace || null,
    };
}

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

        let visibilityClause;
        if (scope === 'personal' || !workspaceId) {
            const wsIds = await workspaceIdsForUser(userId);
            visibilityClause = {
                $or: [
                    { organizer: userId, visibility: 'personal' },
                    { organizer: userId, visibility: 'workspace' },
                    { attendees: userId },
                    { workspace: { $in: wsIds }, visibility: 'workspace' },
                ],
            };
        } else {
            const ctx = await findWorkspaceForUser(workspaceId, userId);
            if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
            visibilityClause = {
                $or: [{ workspace: workspaceId, visibility: 'workspace' }, { organizer: userId }],
            };
        }

        const nonRecurringBranch = {
            $and: [
                inWindow,
                {
                    $or: [
                        { recurrence: { $exists: false } },
                        { 'recurrence.pattern': { $exists: false } },
                        { 'recurrence.pattern': null },
                        { 'recurrence.pattern': 'none' },
                    ],
                },
            ],
        };

        const recurringBranch = {
            $and: [
                { 'recurrence.pattern': { $in: RECURRING_PATTERNS } },
                { start: { $lte: endFilter } },
                {
                    $or: [
                        { 'recurrence.until': { $exists: false } },
                        { 'recurrence.until': null },
                        { 'recurrence.until': { $gte: startFilter } },
                    ],
                },
            ],
        };

        const filter = {
            $and: [visibilityClause, { $or: [nonRecurringBranch, recurringBranch] }],
        };

        const events = await CalendarEvent.find(filter)
            .populate('organizer', 'name email')
            .populate('attendees', 'name email')
            .populate('workspace', 'name color')
            .sort({ start: 1 })
            .lean();

        const expanded = [];
        for (const ev of events) {
            const pattern = ev.recurrence && ev.recurrence.pattern;
            if (!pattern || pattern === 'none') {
                expanded.push({
                    ...ev,
                    _recurrenceInstanceKey: String(ev._id),
                });
                continue;
            }
            const instances = expandRecurrence(ev, startFilter, endFilter);
            const keyBase = String(ev._id);
            for (const inst of instances) {
                expanded.push({
                    ...ev,
                    start: inst.start,
                    end: inst.end,
                    _recurrenceInstanceKey: `${keyBase}_${inst.start.getTime()}`,
                });
            }
        }

        expanded.sort((a, b) => new Date(a.start) - new Date(b.start));
        res.json(expanded);
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
            guestEmails,
            meetingLink,
            eventColor,
            availability,
            reminderMinutesBefore,
            location,
            workspaceId,
            visibility,
            visibilityKind,
            eventType,
            recurrence,
            startTimeZone,
            endTimeZone,
            separateEndTimeZone,
        } = req.body;
        if (!title || !start || !end) {
            return res.status(400).json({ message: 'title, start, and end are required' });
        }

        const mappedVisibility =
            visibilityKind === 'public' ? 'workspace' : 'personal';

        const doc = {
            title: title.trim(),
            description: description || '',
            start: new Date(start),
            end: new Date(end),
            allDay: !!allDay,
            startTimeZone: !allDay && startTimeZone ? String(startTimeZone) : '',
            endTimeZone: !allDay && endTimeZone ? String(endTimeZone) : '',
            separateEndTimeZone: !!allDay ? false : !!separateEndTimeZone,
            organizer: req.user.id,
            attendees: Array.isArray(attendees) ? attendees : [],
            guestEmails: Array.isArray(guestEmails) ? guestEmails : [],
            meetingLink: meetingLink || '',
            eventColor: eventColor || '',
            availability: availability || 'busy',
            reminderMinutesBefore:
                typeof reminderMinutesBefore === 'number' ? reminderMinutesBefore : 30,
            location: location || '',
            visibility: visibilityKind ? mappedVisibility : (visibility || 'personal'),
            visibilityKind: visibilityKind || 'default',
            eventType: eventType || 'meeting',
            recurrence: {
                pattern:
                    recurrence && RECURRING_PATTERNS.includes(recurrence.pattern)
                        ? recurrence.pattern
                        : 'none',
                until:
                    recurrence && recurrence.until ? new Date(recurrence.until) : null,
                exceptions:
                    recurrence && Array.isArray(recurrence.exceptions)
                        ? recurrence.exceptions.map((x) => new Date(x))
                        : [],
            },
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

        const scopeQ = req.query.scope;
        const instanceStartRaw = req.query.instanceStart;
        const pattern = ev.recurrence && ev.recurrence.pattern;
        const isRecurring = pattern && RECURRING_PATTERNS.includes(pattern);
        const changingTime =
            req.body.start !== undefined || req.body.end !== undefined || req.body.allDay !== undefined;

        /* Drag/resize on an expanded instance: scope + instanceStart disambiguate recurring edits. */
        if (isRecurring && changingTime && instanceStartRaw) {
            const inst = new Date(instanceStartRaw);
            if (Number.isNaN(inst.getTime())) {
                return res.status(400).json({ message: 'instanceStart must be a valid date' });
            }
            if (scopeQ !== 'single' && scopeQ !== 'following' && scopeQ !== 'all') {
                return res.status(400).json({ message: 'scope query must be single, following, or all' });
            }

            const newStart = req.body.start !== undefined ? new Date(req.body.start) : new Date(ev.start);
            const newEnd = req.body.end !== undefined ? new Date(req.body.end) : new Date(ev.end);
            if (!Number.isFinite(newStart.getTime()) || !Number.isFinite(newEnd.getTime()) || newEnd <= newStart) {
                return res.status(400).json({ message: 'valid start and end are required' });
            }
            const newAllDay = req.body.allDay !== undefined ? !!req.body.allDay : !!ev.allDay;

            const populateAndSend = async (doc) => {
                const out = await CalendarEvent.findById(doc._id)
                    .populate('organizer', 'name email')
                    .populate('attendees', 'name email')
                    .populate('workspace', 'name color');
                return res.json(out);
            };

            if (scopeQ === 'all') {
                const delta = newStart.getTime() - inst.getTime();
                ev.start = new Date(ev.start.getTime() + delta);
                ev.end = new Date(ev.end.getTime() + delta);
                if (req.body.allDay !== undefined) {
                    ev.allDay = newAllDay;
                    if (ev.allDay) {
                        ev.startTimeZone = '';
                        ev.endTimeZone = '';
                        ev.separateEndTimeZone = false;
                    }
                }
                await ev.save();
                return populateAndSend(ev);
            }

            if (scopeQ === 'single') {
                if (!ev.recurrence.exceptions) ev.recurrence.exceptions = [];
                const t = inst.getTime();
                const exists = ev.recurrence.exceptions.some((d) => new Date(d).getTime() === t);
                if (!exists) ev.recurrence.exceptions.push(inst);
                await ev.save();

                const plain = ev.toObject();
                const created = await CalendarEvent.create({
                    ...baseCloneFields(plain),
                    start: newStart,
                    end: newEnd,
                    allDay: newAllDay,
                    startTimeZone: newAllDay ? '' : plain.startTimeZone || '',
                    endTimeZone: newAllDay ? '' : plain.endTimeZone || '',
                    separateEndTimeZone: newAllDay ? false : !!plain.separateEndTimeZone,
                    recurrence: { pattern: 'none', until: null, exceptions: [] },
                });
                return populateAndSend(created);
            }

            if (scopeQ === 'following') {
                const anchor = new Date(ev.start);
                const originalUntil = ev.recurrence.until ? new Date(ev.recurrence.until) : null;

                if (inst.getTime() <= anchor.getTime()) {
                    ev.start = newStart;
                    ev.end = newEnd;
                    ev.allDay = newAllDay;
                    if (newAllDay) {
                        ev.startTimeZone = '';
                        ev.endTimeZone = '';
                        ev.separateEndTimeZone = false;
                    } else if (req.body.startTimeZone !== undefined) {
                        ev.startTimeZone = String(req.body.startTimeZone || '');
                    } else if (req.body.endTimeZone !== undefined) {
                        ev.endTimeZone = String(req.body.endTimeZone || '');
                    }
                    await ev.save();
                    return populateAndSend(ev);
                }

                ev.recurrence.until = new Date(inst.getTime() - 1);
                await ev.save();

                const plain = await CalendarEvent.findById(ev._id).lean();
                const created = await CalendarEvent.create({
                    ...baseCloneFields(plain),
                    start: newStart,
                    end: newEnd,
                    allDay: newAllDay,
                    startTimeZone: newAllDay ? '' : plain.startTimeZone || '',
                    endTimeZone: newAllDay ? '' : plain.endTimeZone || '',
                    separateEndTimeZone: newAllDay ? false : !!plain.separateEndTimeZone,
                    recurrence: {
                        pattern,
                        until: originalUntil,
                        exceptions: [],
                    },
                });
                return populateAndSend(created);
            }
        }

        const fields = [
            'title',
            'description',
            'start',
            'end',
            'allDay',
            'attendees',
            'guestEmails',
            'meetingLink',
            'eventColor',
            'availability',
            'reminderMinutesBefore',
            'location',
            'visibility',
            'visibilityKind',
            'eventType',
            'workspace',
            'startTimeZone',
            'endTimeZone',
            'separateEndTimeZone',
        ];
        for (const f of fields) {
            if (req.body[f] !== undefined) {
                if (f === 'start' || f === 'end') ev[f] = new Date(req.body[f]);
                else if (f === 'allDay') {
                    ev.allDay = !!req.body[f];
                    if (ev.allDay) {
                        ev.startTimeZone = '';
                        ev.endTimeZone = '';
                        ev.separateEndTimeZone = false;
                    }
                } else if (f === 'startTimeZone') ev.startTimeZone = String(req.body[f] || '');
                else if (f === 'endTimeZone') ev.endTimeZone = String(req.body[f] || '');
                else if (f === 'separateEndTimeZone') ev.separateEndTimeZone = !!req.body[f];
                else if (f === 'attendees') ev.attendees = Array.isArray(req.body[f]) ? req.body[f] : [];
                else if (f === 'guestEmails') ev.guestEmails = Array.isArray(req.body[f]) ? req.body[f] : [];
                else if (f === 'title') ev.title = String(req.body[f]).trim();
                else if (f === 'workspace') {
                    if (req.body[f]) {
                        const ctx = await findWorkspaceForUser(req.body[f], req.user.id);
                        if (!ctx) return res.status(404).json({ message: 'Workspace not found' });
                        ev.workspace = req.body[f];
                    } else {
                        ev.workspace = null;
                    }
                } else if (f === 'visibilityKind') {
                    ev.visibilityKind = req.body[f];
                    ev.visibility = ev.visibilityKind === 'public' ? 'workspace' : 'personal';
                } else ev[f] = req.body[f];
            }
        }
        if (req.body.recurrence !== undefined) {
            const r = req.body.recurrence;
            if (!ev.recurrence) ev.recurrence = {};
            if (typeof r.pattern === 'string') {
                const pattern = RECURRING_PATTERNS.includes(r.pattern)
                    ? r.pattern
                    : r.pattern === 'none'
                      ? 'none'
                      : ev.recurrence.pattern || 'none';
                ev.recurrence.pattern = pattern;
                if (pattern === 'none') {
                    ev.recurrence.until = null;
                    ev.recurrence.exceptions = [];
                }
            }
            if (ev.recurrence.pattern !== 'none') {
                if (r.until !== undefined && r.until !== null) {
                    ev.recurrence.until = new Date(r.until);
                } else if (r.until === null) {
                    ev.recurrence.until = null;
                }
                if (Array.isArray(r.exceptions)) {
                    ev.recurrence.exceptions = r.exceptions.map((x) => new Date(x));
                }
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
        const { scope = 'all', instanceStart } = req.query;
        const ev = await CalendarEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ message: 'Event not found' });
        if (ev.organizer.toString() !== req.user.id.toString() && (req.user.role || 'employee') !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }

        const pattern = ev.recurrence && ev.recurrence.pattern;
        const isRecurring = pattern && pattern !== 'none';

        if (!isRecurring || scope === 'all') {
            await CalendarEvent.deleteOne({ _id: ev._id });
            return res.json({ message: 'Deleted' });
        }

        const inst = instanceStart ? new Date(instanceStart) : null;
        if (!inst || Number.isNaN(inst.getTime())) {
            return res.status(400).json({ message: 'instanceStart is required for recurring delete' });
        }

        const anchor = new Date(ev.start);

        if (scope === 'single') {
            if (!ev.recurrence.exceptions) ev.recurrence.exceptions = [];
            const t = inst.getTime();
            const exists = ev.recurrence.exceptions.some((d) => new Date(d).getTime() === t);
            if (!exists) ev.recurrence.exceptions.push(inst);
            await ev.save();
            return res.json({ message: 'Updated' });
        }

        if (scope === 'following') {
            if (inst.getTime() <= anchor.getTime()) {
                await CalendarEvent.deleteOne({ _id: ev._id });
                return res.json({ message: 'Deleted' });
            }
            ev.recurrence.until = new Date(inst.getTime() - 1);
            await ev.save();
            return res.json({ message: 'Updated' });
        }

        await CalendarEvent.deleteOne({ _id: ev._id });
        res.json({ message: 'Deleted' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
};
