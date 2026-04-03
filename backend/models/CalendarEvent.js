const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        allDay: { type: Boolean, default: false },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
    },
    { timestamps: true }
);

calendarEventSchema.index({ organizer: 1, start: 1 });
calendarEventSchema.index({ workspace: 1, start: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
