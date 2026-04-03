const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        allDay: { type: Boolean, default: false },
        /** IANA time zone for timed events (wall clock for start / end). */
        startTimeZone: { type: String, default: '' },
        endTimeZone: { type: String, default: '' },
        separateEndTimeZone: { type: Boolean, default: false },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        // Google-Calendar-like event details
        guestEmails: { type: [String], default: [] }, // free-form emails from the UI
        meetingLink: { type: String, default: '' }, // e.g. Google Meet URL
        eventColor: { type: String, default: '' }, // hex color
        availability: { type: String, enum: ['busy', 'free'], default: 'busy' }, // Busy/Free
        reminderMinutesBefore: { type: Number, default: 30 }, // 0 = at start time
        visibilityKind: {
            type: String,
            enum: ['default', 'public', 'private'],
            default: 'default',
        },
        location: { type: String, default: '' },
        workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
        visibility: {
            type: String,
            enum: ['personal', 'workspace'],
            default: 'personal',
        },
        eventType: {
            type: String,
            enum: ['meeting', 'task', 'reminder', 'other'],
            default: 'meeting',
        },
        recurrence: {
            pattern: {
                type: String,
                enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays'],
                default: 'none',
            },
            /** Last date/time occurrences may begin (optional end of series). */
            until: { type: Date, default: null },
            /** Occurrence start times (ms-aligned) excluded from expansion ("this event only" deletes). */
            exceptions: { type: [Date], default: [] },
        },
    },
    { timestamps: true }
);

calendarEventSchema.index({ organizer: 1, start: 1 });
calendarEventSchema.index({ workspace: 1, start: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
