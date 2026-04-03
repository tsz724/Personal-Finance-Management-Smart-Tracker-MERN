import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

function getFetchRange(date, view) {
  const d = moment(date);
  switch (view) {
    case Views.MONTH:
      return {
        from: d.clone().startOf('month').subtract(1, 'month').startOf('day'),
        to: d.clone().endOf('month').add(1, 'month').endOf('day'),
      };
    case Views.WEEK:
    case Views.WORK_WEEK:
      return {
        from: d.clone().startOf('week').subtract(1, 'week'),
        to: d.clone().endOf('week').add(1, 'week'),
      };
    case Views.DAY:
      return {
        from: d.clone().subtract(1, 'week'),
        to: d.clone().add(1, 'week'),
      };
    case Views.AGENDA:
    default:
      return {
        from: d.clone().startOf('day'),
        to: d.clone().add(6, 'months').endOf('day'),
      };
  }
}

function toInputDatetimeLocal(d) {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
}

function toInputDate(d) {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

function parseInputDateOnly(dateStr, endOfDay) {
  if (!dateStr) return null;
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return d;
}

function mapApiToRbcEvents(list, palette) {
  const typeColors = {
    meeting: palette.primary,
    task: palette.secondary,
    reminder: palette.warning || palette.secondary,
    other: palette.grey,
  };
  return (list || []).map((ev) => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const c = typeColors[ev.eventType] || typeColors.other;
    return {
      id: ev._id,
      title: ev.title,
      start,
      end: end > start ? end : new Date(start.getTime() + 60 * 60 * 1000),
      allDay: !!ev.allDay,
      resource: ev,
      style: {
        backgroundColor: c.main,
        borderColor: c.dark,
        color: '#fff',
        borderRadius: 6,
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
      },
    };
  });
}

export default function CalendarPage() {
  const theme = useTheme();
  const palette = useMemo(
    () => ({
      primary: theme.palette.primary,
      secondary: theme.palette.secondary,
      grey: { main: theme.palette.grey[600], dark: theme.palette.grey[800] },
      warning: theme.palette.warning,
    }),
    [theme.palette]
  );

  useUserAuth();
  const [rawEvents, setRawEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('meeting');

  const load = useCallback(async () => {
    const { from, to } = getFetchRange(currentDate, currentView);
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.CALENDAR, {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
          scope: 'all',
        },
      });
      setRawEvents(data);
    } catch (e) {
      toast.error('Could not load calendar');
    }
  }, [currentDate, currentView]);

  useEffect(() => {
    load();
  }, [load]);

  const calendarEvents = useMemo(() => mapApiToRbcEvents(rawEvents, palette), [rawEvents, palette]);

  const openNewDialog = (startAt, endAt, allDayEvent) => {
    setEditingId(null);
    setTitle('');
    setLocation('');
    setEventType('meeting');
    setAllDay(!!allDayEvent);
    if (allDayEvent) {
      setStart(toInputDate(startAt));
      setEnd(toInputDate(endAt || startAt));
    } else {
      setStart(toInputDatetimeLocal(startAt));
      setEnd(toInputDatetimeLocal(endAt || new Date(new Date(startAt).getTime() + 60 * 60 * 1000)));
    }
    setOpen(true);
  };

  const openEditDialog = (rbcEvent) => {
    const ev = rbcEvent.resource;
    setEditingId(ev._id);
    setTitle(ev.title || '');
    setLocation(ev.location || '');
    setEventType(ev.eventType || 'meeting');
    setAllDay(!!ev.allDay);
    if (ev.allDay) {
      setStart(toInputDate(ev.start));
      setEnd(toInputDate(ev.end));
    } else {
      setStart(toInputDatetimeLocal(ev.start));
      setEnd(toInputDatetimeLocal(ev.end));
    }
    setOpen(true);
  };

  const buildPayload = () => {
    let startDate;
    let endDate;
    if (allDay) {
      startDate = parseInputDateOnly(start, false);
      endDate = parseInputDateOnly(end, true);
    } else {
      startDate = start ? new Date(start) : null;
      endDate = end ? new Date(end) : null;
    }
    return {
      title: title.trim(),
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
      allDay,
      location,
      eventType,
      visibility: 'personal',
    };
  };

  const save = async () => {
    const payload = buildPayload();
    if (!payload.title || !payload.start || !payload.end) {
      toast.error('Title, start, and end are required');
      return;
    }
    if (new Date(payload.end) <= new Date(payload.start)) {
      toast.error('End must be after start');
      return;
    }
    try {
      if (editingId) {
        await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(editingId), payload);
        toast.success('Event updated');
      } else {
        await axiosInstance.post(API_PATHS.BUSINESS.CALENDAR, payload);
        toast.success('Event added');
      }
      setOpen(false);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(editingId ? 'Update failed' : 'Save failed');
    }
  };

  const remove = async () => {
    if (!editingId) return;
    if (!window.confirm('Delete this event?')) return;
    try {
      await axiosInstance.delete(API_PATHS.BUSINESS.CALENDAR_EVENT(editingId));
      toast.success('Event deleted');
      setOpen(false);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const onSelectSlot = useCallback((slotInfo) => {
    const s = slotInfo.start;
    const e = slotInfo.end;
    const spansMidnight =
      s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 0 && e.getMinutes() === 0 && e - s >= 86400000;
    const allDaySlot = slotInfo.action === 'select' && (Views.MONTH === currentView || spansMidnight);
    openNewDialog(s, e, allDaySlot || (currentView === Views.MONTH && slotInfo.action === 'click'));
  }, [currentView]);

  const onSelectEvent = useCallback((evt) => {
    openEditDialog(evt);
  }, []);

  const eventStyleGetter = useCallback((event) => ({
    style: {
      ...event.style,
      cursor: 'move',
    },
  }), []);

  const updateEventTimes = useCallback(
    async (rbcEvent, start, end, isAllDay) => {
      const ev = rbcEvent?.resource || {};
      const id = ev._id || rbcEvent?.id;
      if (!id) return;

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return;

      // Backend requires end > start; RBC should provide it, but guard anyway.
      const normalizedEnd = endDate <= startDate ? new Date(startDate.getTime() + 60 * 60 * 1000) : endDate;

      const payload = {
        title: String(ev.title || '').trim() || 'Untitled',
        description: ev.description || '',
        start: startDate.toISOString(),
        end: normalizedEnd.toISOString(),
        allDay: typeof isAllDay === 'boolean' ? isAllDay : !!ev.allDay,
        location: ev.location || '',
        eventType: ev.eventType || 'meeting',
        visibility: ev.visibility || 'personal',
      };

      try {
        await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(id), payload);
        toast.success('Event updated');
      } catch (e) {
        toast.error(e.response?.data?.message || 'Could not update event');
      } finally {
        load();
      }
    },
    [load]
  );

  const onEventDrop = useCallback(
    ({ event, start, end, allDay: isAllDay }) => {
      updateEventTimes(event, start, end, isAllDay);
    },
    [updateEventTimes]
  );

  const onEventResize = useCallback(
    ({ event, start, end, allDay: isAllDay }) => {
      updateEventTimes(event, start, end, isAllDay);
    },
    [updateEventTimes]
  );

  return (
    <Homelayout activeMenu="Calendar">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Calendar
        </Typography>
        <Button variant="contained" onClick={() => openNewDialog(new Date(), new Date(Date.now() + 60 * 60 * 1000), false)}>
          Create event
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Month, week, day, and agenda views — click a slot or drag to create. Click an event to edit.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 1, sm: 2 },
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            height: { xs: '70vh', md: 'calc(100vh - 240px)' },
            minHeight: 520,
            '& .rbc-calendar': {
              fontFamily: theme.typography.fontFamily,
              color: 'text.primary',
            },
            '& .rbc-toolbar': {
              flexWrap: 'wrap',
              gap: 1,
              marginBottom: 2,
              '& .rbc-toolbar-label': {
                ...theme.typography.subtitle1,
                fontWeight: 700,
                order: { xs: 3, sm: 0 },
                width: { xs: '100%', sm: 'auto' },
                textAlign: { xs: 'center', sm: 'inherit' },
              },
            },
            '& .rbc-btn-group': {
              '& button': {
                ...theme.typography.button,
                textTransform: 'none',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: `${theme.shape.borderRadius}px`,
                padding: '6px 14px',
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.rbc-active': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.main,
                },
              },
            },
            '& .rbc-header': {
              padding: '10px 4px',
              fontWeight: 600,
              fontSize: 12,
              textTransform: 'uppercase',
              color: theme.palette.text.secondary,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .rbc-month-view, & .rbc-time-view': {
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              overflow: 'hidden',
            },
            '& .rbc-day-bg + .rbc-day-bg, & .rbc-time-header-content, & .rbc-day-slot .rbc-time-slot': {
              borderColor: theme.palette.divider,
            },
            '& .rbc-off-range-bg': {
              backgroundColor: theme.palette.action.hover,
            },
            '& .rbc-today': {
              backgroundColor: theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.06)' : 'rgba(129, 140, 248, 0.12)',
            },
            '& .rbc-current-time-indicator': {
              backgroundColor: theme.palette.error.main,
            },
            '& .rbc-show-more': {
              color: theme.palette.primary.main,
              fontWeight: 600,
            },
            '& .rbc-agenda-view': {
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            },
            '& .rbc-agenda-table': {
              border: 'none',
            },
            '& .rbc-agenda-date-cell, & .rbc-agenda-time-cell': {
              borderColor: theme.palette.divider,
            },
          }}
        >
          <DnDCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={currentView}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            date={currentDate}
            onNavigate={(d) => setCurrentDate(d)}
            onView={(v) => setCurrentView(v)}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            selectable
            popup
            draggableAccessor={() => true}
            resizable
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            step={30}
            timeslots={2}
            showMultiDayTimes
            eventPropGetter={eventStyleGetter}
            messages={{
              today: 'Today',
              previous: 'Back',
              next: 'Next',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
              showMore: (total) => `+${total} more`,
            }}
            formats={{
              agendaDateFormat: 'ddd MMM D',
              agendaTimeFormat: 'h:mm a',
              agendaTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('h:mm a')} – ${moment(end).format('h:mm a')}`,
              dayHeaderFormat: 'dddd, MMMM D',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('MMM D')} – ${moment(end).format('MMM D, YYYY')}`,
            }}
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit event' : 'New event'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
          <FormControlLabel
            control={<Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />}
            label="All day"
            sx={{ mt: 1 }}
          />
          {allDay ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start date"
                type="date"
                fullWidth
                value={start}
                onChange={(e) => setStart(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End date"
                type="date"
                fullWidth
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          ) : (
            <>
              <TextField
                label="Start"
                type="datetime-local"
                fullWidth
                value={start}
                onChange={(e) => setStart(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End"
                type="datetime-local"
                fullWidth
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
          <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="reminder">Reminder</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {editingId ? (
            <Button color="error" onClick={remove} sx={{ mr: 'auto' }}>
              Delete
            </Button>
          ) : null}
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Homelayout>
  );
}
