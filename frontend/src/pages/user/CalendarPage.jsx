import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { useTheme, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
  const { user } = useContext(UserContext);
  const isDark = theme.palette.mode === 'dark';

  const cal = useMemo(() => {
    if (isDark) {
      return {
        surface: '#1f1f1f',
        surfaceElevated: '#2a2a2a',
        border: alpha('#fff', 0.08),
        text: alpha('#fff', 0.92),
        muted: alpha('#fff', 0.6),
        offRangeBg: alpha('#000', 0.25),
        infoBoxBg: alpha('#000', 0.2),
        standardUnderline: alpha('#fff', 0.12),
        appointmentText: alpha('#fff', 0.86),
        selectHoverOutline: alpha('#fff', 0.18),
        holidayCheck: alpha('#fff', 0.25),
        createBtnBg: alpha('#aecbfa', 0.25),
        createBtnColor: '#aecbfa',
        createBtnHoverBg: alpha('#aecbfa', 0.34),
        saveBtnBg: alpha('#aecbfa', 0.85),
        saveBtnColor: '#062e6f',
        saveBtnHoverBg: '#aecbfa',
        tabSelectedFg: '#fff',
        showMoreColor: theme.palette.primary.light,
        linkColor: theme.palette.primary.light,
        deleteColor: theme.palette.error.light,
      };
    }
    return {
      surface: theme.palette.grey[100],
      surfaceElevated: theme.palette.background.paper,
      border: theme.palette.divider,
      text: theme.palette.text.primary,
      muted: theme.palette.text.secondary,
      offRangeBg: alpha(theme.palette.common.black, 0.04),
      infoBoxBg: alpha(theme.palette.primary.main, 0.06),
      standardUnderline: theme.palette.divider,
      appointmentText: theme.palette.text.primary,
      selectHoverOutline: theme.palette.text.secondary,
      holidayCheck: theme.palette.action.active,
      createBtnBg: alpha(theme.palette.primary.main, 0.12),
      createBtnColor: theme.palette.primary.dark,
      createBtnHoverBg: alpha(theme.palette.primary.main, 0.2),
      saveBtnBg: theme.palette.primary.main,
      saveBtnColor: theme.palette.primary.contrastText,
      saveBtnHoverBg: theme.palette.primary.dark,
      tabSelectedFg: theme.palette.primary.contrastText,
      showMoreColor: theme.palette.primary.main,
      linkColor: theme.palette.primary.main,
      deleteColor: theme.palette.error.main,
    };
  }, [theme, isDark]);

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
  const [currentView, setCurrentView] = useState(Views.WEEK);

  const [myCalOpen, setMyCalOpen] = useState(true);
  const [otherCalOpen, setOtherCalOpen] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [composerTab, setComposerTab] = useState('event');

  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startMoment, setStartMoment] = useState(() => moment());
  const [endMoment, setEndMoment] = useState(() => moment().add(1, 'hour'));

  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [guests, setGuests] = useState('');
  const [meetNote, setMeetNote] = useState('');

  const [taskDeadline, setTaskDeadline] = useState(null);
  const [taskList, setTaskList] = useState('My Tasks');
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

  useEffect(() => {
    if (!allDay) {
      setStartMoment(moment(start || undefined));
      setEndMoment(moment(end || undefined));
      return;
    }
    const sd = parseInputDateOnly(start, false);
    const ed = parseInputDateOnly(end, true);
    if (sd) setStartMoment(moment(sd));
    if (ed) setEndMoment(moment(ed));
  }, [start, end, allDay]);

  const calendarEvents = useMemo(() => mapApiToRbcEvents(rawEvents, palette), [rawEvents, palette]);

  const headerLabel = useMemo(() => {
    if (currentView === Views.MONTH) return moment(currentDate).format('MMMM YYYY');
    if (currentView === Views.WEEK) {
      const s = moment(currentDate).startOf('week');
      const e = moment(currentDate).endOf('week');
      return `${s.format('MMM D')} – ${e.format('MMM D, YYYY')}`;
    }
    if (currentView === Views.DAY) return moment(currentDate).format('dddd, MMMM D, YYYY');
    return moment(currentDate).format('MMMM YYYY');
  }, [currentDate, currentView]);

  const primaryActionLabel = useMemo(() => {
    if (composerTab === 'task') return 'Save';
    if (composerTab === 'appointment') return 'Set up the schedule';
    return 'Save';
  }, [composerTab]);

  const openNewDialog = (startAt, endAt, allDayEvent) => {
    setEditingId(null);
    setComposerTab('event');
    setTitle('');
    setLocation('');
    setDescription('');
    setGuests('');
    setMeetNote('');
    setTaskDeadline(null);
    setTaskList('My Tasks');
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
    setComposerTab(ev.eventType === 'task' ? 'task' : 'event');
    setTitle(ev.title || '');
    setLocation(ev.location || '');
    setDescription(ev.description || '');
    setGuests('');
    setMeetNote('');
    setTaskDeadline(null);
    setTaskList('My Tasks');
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

    const guestsLine = guests.trim() ? `Guests: ${guests.trim()}` : '';
    const meetLine = meetNote.trim() ? `Meet: ${meetNote.trim()}` : '';
    const descParts = [description.trim(), guestsLine, meetLine].filter(Boolean);
    const combinedDescription = descParts.join('\n');

    const mappedType =
      composerTab === 'task' ? 'task' : composerTab === 'appointment' ? 'meeting' : eventType;

    return {
      title: title.trim() || '(No title)',
      description: combinedDescription,
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
      allDay,
      location,
      eventType: mappedType,
      visibility: 'personal',
    };
  };

  const save = async () => {
    const payload = buildPayload();
    if (!payload.start || !payload.end) {
      toast.error('Start and end are required');
      return;
    }
    if (composerTab === 'appointment') {
      toast.message('Appointment schedule UI is ready — booking flow can be wired later.');
    }
    if (new Date(payload.end) <= new Date(payload.start)) {
      toast.error('End must be after start');
      return;
    }
    try {
      if (editingId) {
        await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(editingId), payload);
        toast.success('Saved');
      } else {
        await axiosInstance.post(API_PATHS.BUSINESS.CALENDAR, payload);
        toast.success('Saved');
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
      toast.success('Deleted');
      setOpen(false);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const onSelectSlot = useCallback(
    (slotInfo) => {
      const s = slotInfo.start;
      const e = slotInfo.end;
      const spansMidnight =
        s.getHours() === 0 &&
        s.getMinutes() === 0 &&
        e.getHours() === 0 &&
        e.getMinutes() === 0 &&
        e - s >= 86400000;
      const allDaySlot = slotInfo.action === 'select' && (Views.MONTH === currentView || spansMidnight);
      openNewDialog(s, e, allDaySlot || (currentView === Views.MONTH && slotInfo.action === 'click'));
    },
    [currentView]
  );

  const onSelectEvent = useCallback((evt) => {
    openEditDialog(evt);
  }, []);

  const eventStyleGetter = useCallback(
    (event) => ({
      style: {
        ...event.style,
        cursor: 'move',
      },
    }),
    []
  );

  const updateEventTimes = useCallback(
    async (rbcEvent, startDate, endDate, isAllDay) => {
      const ev = rbcEvent?.resource || {};
      const id = ev._id || rbcEvent?.id;
      if (!id) return;

      const s = new Date(startDate);
      const en = new Date(endDate);
      if (!Number.isFinite(s.getTime()) || !Number.isFinite(en.getTime())) return;

      const normalizedEnd = en <= s ? new Date(s.getTime() + 60 * 60 * 1000) : en;

      const payload = {
        title: String(ev.title || '').trim() || 'Untitled',
        description: ev.description || '',
        start: s.toISOString(),
        end: normalizedEnd.toISOString(),
        allDay: typeof isAllDay === 'boolean' ? isAllDay : !!ev.allDay,
        location: ev.location || '',
        eventType: ev.eventType || 'meeting',
        visibility: ev.visibility || 'personal',
      };

      try {
        await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(id), payload);
        toast.success('Updated');
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

  const navigateCal = (direction) => {
    const m = moment(currentDate);
    const delta = direction === 'PREV' ? -1 : 1;
    if (currentView === Views.MONTH) setCurrentDate(m.add(delta, 'month').toDate());
    else if (currentView === Views.WEEK || currentView === Views.WORK_WEEK)
      setCurrentDate(m.add(delta, 'week').toDate());
    else if (currentView === Views.DAY) setCurrentDate(m.add(delta, 'day').toDate());
    else setCurrentDate(m.add(delta, 'month').toDate());
  };

  const displayName = user?.name || 'Me';

  return (
    <Homelayout activeMenu="Calendar">
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Box
          sx={{
            m: { xs: -2, md: -3 },
            mt: { xs: -1, md: -2 },
            bgcolor: cal.surface,
            color: cal.text,
            minHeight: 'calc(100vh - 72px)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: 'calc(100vh - 72px)' }}>
            <Paper
              elevation={0}
              sx={{
                width: { xs: 1, md: 320 },
                borderRight: { md: `1px solid ${cal.border}` },
                borderBottom: { xs: `1px solid ${cal.border}`, md: 'none' },
                bgcolor: cal.surface,
                color: cal.text,
                borderRadius: 0,
                p: 2,
              }}
            >
              <Button
                fullWidth
                startIcon={<AddIcon />}
                variant="contained"
                sx={{
                  borderRadius: 999,
                  py: 1.2,
                  backgroundColor: cal.createBtnBg,
                  color: cal.createBtnColor,
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: cal.createBtnHoverBg, boxShadow: 'none' },
                }}
                onClick={() => openNewDialog(new Date(), new Date(Date.now() + 60 * 60 * 1000), false)}
              >
                Create
              </Button>

              <Box sx={{ mt: 2 }}>
                <DateCalendar
                  value={moment(currentDate)}
                  onChange={(v) => {
                    if (!v) return;
                    const d = v.toDate();
                    setCurrentDate(d);
                  }}
                  sx={{
                    width: '100%',
                    maxWidth: 340,
                    mx: 'auto',
                    color: cal.text,
                    '& .MuiPickersCalendarHeader-label': { color: cal.text },
                    '& .MuiDayCalendar-weekDayLabel': { color: cal.muted },
                    '& .MuiPickersDay-root': { color: cal.text },
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: cal.border }} />

              <List dense disablePadding>
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemText primary="Booking pages" secondary="(coming soon)" secondaryTypographyProps={{ sx: { color: cal.muted } }} />
                  <IconButton size="small" sx={{ color: cal.muted }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </ListItem>

                <ListItem disablePadding sx={{ py: 0.25, cursor: 'pointer' }} onClick={() => setMyCalOpen((v) => !v)}>
                  <ListItemIcon sx={{ minWidth: 32, color: cal.muted }}>
                    {myCalOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemIcon>
                  <ListItemText primary="My calendars" primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItem>
                <Collapse in={myCalOpen} timeout="auto" unmountOnExit>
                  <Stack spacing={1} sx={{ pl: 3, pr: 1, pb: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          size="small"
                          sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                        />
                      }
                      label={<Typography variant="body2">{displayName}</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked
                          size="small"
                          sx={{ color: isDark ? theme.palette.secondary.light : theme.palette.secondary.main }}
                        />
                      }
                      label={<Typography variant="body2">Tasks</Typography>}
                    />
                  </Stack>
                </Collapse>

                <ListItem disablePadding sx={{ py: 0.25, cursor: 'pointer' }} onClick={() => setOtherCalOpen((v) => !v)}>
                  <ListItemIcon sx={{ minWidth: 32, color: cal.muted }}>
                    {otherCalOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemIcon>
                  <ListItemText primary="Other calendars" primaryTypographyProps={{ fontWeight: 700 }} />
                </ListItem>
                <Collapse in={otherCalOpen} timeout="auto" unmountOnExit>
                  <Stack spacing={1} sx={{ pl: 3, pr: 1, pb: 1 }}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked size="small" sx={{ color: cal.holidayCheck }} />}
                      label={<Typography variant="body2">Holidays</Typography>}
                    />
                  </Stack>
                </Collapse>
              </List>
            </Paper>

            <Box sx={{ flex: 1, p: { xs: 1.5, md: 2 } }}>
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${cal.border}`,
                  borderRadius: 2,
                  bgcolor: cal.surface,
                  color: cal.text,
                  overflow: 'hidden',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${cal.border}` }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentDate(new Date())}
                    sx={{
                      borderColor: cal.border,
                      color: cal.text,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Today
                  </Button>
                  <IconButton sx={{ color: cal.text }} onClick={() => navigateCal('PREV')} aria-label="previous">
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton sx={{ color: cal.text }} onClick={() => navigateCal('NEXT')} aria-label="next">
                    <ChevronRightIcon />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ flex: 1, ml: 1 }}>
                    {headerLabel}
                  </Typography>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: cal.muted }}>View</InputLabel>
                    <Select
                      label="View"
                      value={currentView}
                      onChange={(e) => setCurrentView(e.target.value)}
                      sx={{
                        color: cal.text,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: cal.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: cal.selectHoverOutline },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                      }}
                    >
                      <MenuItem value={Views.MONTH}>Month</MenuItem>
                      <MenuItem value={Views.WEEK}>Week</MenuItem>
                      <MenuItem value={Views.DAY}>Day</MenuItem>
                      <MenuItem value={Views.AGENDA}>Agenda</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Box
                  sx={{
                    height: { xs: '70vh', md: 'calc(100vh - 230px)' },
                    minHeight: 560,
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 2 },
                    '& .rbc-calendar': {
                      fontFamily: theme.typography.fontFamily,
                      color: cal.text,
                    },
                    '& .rbc-toolbar': { display: 'none' },
                    '& .rbc-header': {
                      padding: '10px 4px',
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      color: cal.muted,
                      borderBottom: `1px solid ${cal.border}`,
                    },
                    '& .rbc-month-view, & .rbc-time-view': {
                      border: `1px solid ${cal.border}`,
                      borderRadius: 1,
                      overflow: 'hidden',
                    },
                    '& .rbc-day-bg + .rbc-day-bg, & .rbc-time-header-content, & .rbc-day-slot .rbc-time-slot': {
                      borderColor: cal.border,
                    },
                    '& .rbc-off-range-bg': {
                      backgroundColor: cal.offRangeBg,
                    },
                    '& .rbc-today': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    },
                    '& .rbc-time-header-content .rbc-header': {
                      borderBottom: `1px solid ${cal.border}`,
                    },
                    '& .rbc-time-content, & .rbc-day-slot .rbc-background-event': {
                      borderTop: `1px solid ${cal.border}`,
                    },
                    '& .rbc-label': { color: cal.muted },
                    '& .rbc-current-time-indicator': {
                      backgroundColor: theme.palette.error.main,
                    },
                    '& .rbc-show-more': {
                      color: cal.showMoreColor,
                      fontWeight: 700,
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
                    toolbar={false}
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
                      agendaDateFormat: 'ddd MMM D',
                      agendaTimeFormat: 'h:mm a',
                      agendaTimeRangeFormat: ({ start, end }) =>
                        `${moment(start).format('h:mm a')} – ${moment(end).format('h:mm a')}`,
                      dayHeaderFormat: 'dddd, MMMM D',
                      dayRangeHeaderFormat: ({ start, end }) =>
                        `${moment(start).format('MMM D')} – ${moment(end).format('MMM D, YYYY')}`,
                      showMore: (total) => `+${total} more`,
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          </Stack>
        </Box>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: cal.surfaceElevated,
              color: cal.text,
              border: `1px solid ${cal.border}`,
              overflow: 'hidden',
            },
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 1.25 }}>
            <IconButton size="small" sx={{ color: cal.muted, mr: 0.5 }} aria-label="handle">
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={() => setOpen(false)} aria-label="close" sx={{ color: cal.muted }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box sx={{ px: 3, pb: 2 }}>
            <TextField
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="standard"
              fullWidth
              InputProps={{
                disableUnderline: false,
                sx: {
                  fontSize: 34,
                  lineHeight: 1.1,
                  fontWeight: 500,
                  color: cal.text,
                  '&:before': { borderBottomColor: cal.standardUnderline },
                  '&:after': { borderBottomColor: theme.palette.primary.main },
                },
              }}
            />

            <ToggleButtonGroup
              value={composerTab}
              exclusive
              onChange={(_, v) => v && setComposerTab(v)}
              sx={{ mt: 2, gap: 1, flexWrap: 'wrap' }}
            >
              <ToggleButton
                value="event"
                sx={{
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 2,
                  border: 'none',
                  color: cal.muted,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.16),
                    color: cal.tabSelectedFg,
                  },
                  '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.22) },
                }}
              >
                Event
              </ToggleButton>
              <ToggleButton
                value="task"
                sx={{
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 2,
                  border: 'none',
                  color: cal.muted,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.16),
                    color: cal.tabSelectedFg,
                  },
                  '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.22) },
                }}
              >
                Task
              </ToggleButton>
              <ToggleButton
                value="appointment"
                sx={{
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 2,
                  border: 'none',
                  color: cal.muted,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.16),
                    color: cal.tabSelectedFg,
                  },
                  '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.22) },
                }}
              >
                Appointment schedule
              </ToggleButton>
            </ToggleButtonGroup>

            {composerTab === 'appointment' ? (
              <Paper
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: cal.infoBoxBg,
                  borderColor: cal.border,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <InfoOutlinedIcon sx={{ color: cal.linkColor, mt: 0.25 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: cal.appointmentText }}>
                      Create a booking page you can share with others so they can book time with you themselves.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: cal.linkColor, cursor: 'pointer', fontWeight: 700 }}>
                        See how it works
                      </Typography>
                      <Typography variant="body2" sx={{ color: cal.linkColor, cursor: 'pointer', fontWeight: 700 }}>
                        Learn more
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            ) : null}

            <Stack spacing={2} sx={{ mt: 2.5 }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <AccessTimeIcon sx={{ color: cal.muted, mt: 0.75 }} />
                <Box sx={{ flex: 1 }}>
                  {allDay ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <DatePicker
                        label="Start date"
                        value={moment(start, 'YYYY-MM-DD', true).isValid() ? moment(start, 'YYYY-MM-DD') : null}
                        onChange={(v) => v && setStart(v.format('YYYY-MM-DD'))}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: googleFieldSx(cal.text, cal.border, theme),
                          },
                        }}
                      />
                      <DatePicker
                        label="End date"
                        value={moment(end, 'YYYY-MM-DD', true).isValid() ? moment(end, 'YYYY-MM-DD') : null}
                        onChange={(v) => v && setEnd(v.format('YYYY-MM-DD'))}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: googleFieldSx(cal.text, cal.border, theme),
                          },
                        }}
                      />
                    </Stack>
                  ) : (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                      <DatePicker
                        label="Date"
                        value={startMoment}
                        onChange={(v) => {
                          if (!v) return;
                          const nextStart = v
                            .clone()
                            .hour(startMoment.hour())
                            .minute(startMoment.minute())
                            .second(0)
                            .millisecond(0);
                          const duration = Math.max(15 * 60 * 1000, endMoment.valueOf() - startMoment.valueOf());
                          const nextEnd = nextStart.clone().add(duration, 'ms');
                          setStartMoment(nextStart);
                          setEndMoment(nextEnd);
                          setStart(nextStart.format('YYYY-MM-DDTHH:mm'));
                          setEnd(nextEnd.format('YYYY-MM-DDTHH:mm'));
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { ...googleFieldSx(cal.text, cal.border, theme), minWidth: 170 },
                          },
                        }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <TimePicker
                          label="Start"
                          value={startMoment}
                          onChange={(v) => {
                            if (!v) return;
                            const nextStart = startMoment.clone().hour(v.hour()).minute(v.minute()).second(0).millisecond(0);
                            const duration = Math.max(15 * 60 * 1000, endMoment.valueOf() - startMoment.valueOf());
                            const nextEnd = nextStart.clone().add(duration, 'ms');
                            setStartMoment(nextStart);
                            setEndMoment(nextEnd);
                            setStart(nextStart.format('YYYY-MM-DDTHH:mm'));
                            setEnd(nextEnd.format('YYYY-MM-DDTHH:mm'));
                          }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { ...googleFieldSx(cal.text, cal.border, theme), minWidth: 120 },
                            },
                          }}
                        />
                        <Typography sx={{ color: cal.muted }}>–</Typography>
                        <TimePicker
                          label="End"
                          value={endMoment}
                          onChange={(v) => {
                            if (!v) return;
                            const nextEnd = endMoment.clone().hour(v.hour()).minute(v.minute()).second(0).millisecond(0);
                            setEndMoment(nextEnd);
                            setEnd(nextEnd.format('YYYY-MM-DDTHH:mm'));
                          }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              sx: { ...googleFieldSx(cal.text, cal.border, theme), minWidth: 120 },
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  )}
                  <Typography variant="caption" sx={{ color: cal.muted, display: 'block', mt: 1 }}>
                    Time zone • Does not repeat
                  </Typography>
                  <FormControlLabel
                    sx={{ mt: 1, alignItems: 'center' }}
                    control={
                      <Checkbox
                        checked={allDay}
                        size="small"
                        onChange={(e) => {
                          const next = e.target.checked;
                          setAllDay(next);
                          if (next) {
                            setStart(startMoment.format('YYYY-MM-DD'));
                            setEnd(endMoment.format('YYYY-MM-DD'));
                          } else {
                            setStart(startMoment.format('YYYY-MM-DDTHH:mm'));
                            setEnd(endMoment.format('YYYY-MM-DDTHH:mm'));
                          }
                        }}
                        sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                      />
                    }
                    label={<Typography variant="body2">All day</Typography>}
                  />
                </Box>
              </Stack>

              {composerTab !== 'task' ? (
                <>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <PeopleOutlineIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <TextField
                      placeholder="Add guests"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      fullWidth
                      size="small"
                      sx={googleFieldSx(cal.text, cal.border, theme)}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <VideocamOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <TextField
                      placeholder="Add meeting link / notes"
                      value={meetNote}
                      onChange={(e) => setMeetNote(e.target.value)}
                      fullWidth
                      size="small"
                      sx={googleFieldSx(cal.text, cal.border, theme)}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <PlaceOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <TextField
                      placeholder="Add location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      fullWidth
                      size="small"
                      sx={googleFieldSx(cal.text, cal.border, theme)}
                    />
                  </Stack>
                </>
              ) : null}

              {composerTab === 'task' ? (
                <>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <AccessTimeIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <DatePicker
                      label="Deadline (optional)"
                      value={taskDeadline}
                      onChange={(v) => setTaskDeadline(v)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: googleFieldSx(cal.text, cal.border, theme),
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <NotesOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <TextField
                      placeholder="Add description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      sx={googleFieldSx(cal.text, cal.border, theme)}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                    <FormControl fullWidth size="small" sx={googleFieldSx(cal.text, cal.border, theme)}>
                      <InputLabel>Task list</InputLabel>
                      <Select label="Task list" value={taskList} onChange={(e) => setTaskList(e.target.value)}>
                        <MenuItem value="My Tasks">My Tasks</MenuItem>
                        <MenuItem value="Work">Work</MenuItem>
                        <MenuItem value="Personal">Personal</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </>
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <NotesOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <TextField
                    placeholder="Add description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    sx={googleFieldSx(cal.text, cal.border, theme)}
                  />
                </Stack>
              )}

              {composerTab === 'event' ? (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: theme.palette.primary.main }} />
                      <Typography fontWeight={700}>{displayName}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: cal.muted }}>
                      Busy • Default visibility • Notify 30 minutes before
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 1.5, ...googleFieldSx(cal.text, cal.border, theme) }}>
                      <InputLabel>Event type</InputLabel>
                      <Select label="Event type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        <MenuItem value="meeting">Meeting</MenuItem>
                        <MenuItem value="reminder">Reminder</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              ) : composerTab === 'task' ? (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: theme.palette.primary.main }} />
                      <Typography fontWeight={700}>{displayName}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: cal.muted }}>
                      Free • Private
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <Typography fontWeight={700}>{displayName}</Typography>
                </Stack>
              )}
            </Stack>

            <Divider sx={{ my: 2, borderColor: cal.border }} />

            <Stack direction="row" alignItems="center" spacing={2}>
              <Button sx={{ color: cal.linkColor, textTransform: 'none', fontWeight: 800 }}>
                More options
              </Button>
              <Box sx={{ flex: 1 }} />
              {editingId ? (
                <Button onClick={remove} sx={{ color: cal.deleteColor, textTransform: 'none', fontWeight: 800 }}>
                  Delete
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={save}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  backgroundColor: cal.saveBtnBg,
                  color: cal.saveBtnColor,
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: cal.saveBtnHoverBg, boxShadow: 'none' },
                }}
              >
                {primaryActionLabel}
              </Button>
            </Stack>
          </Box>
        </Dialog>
      </LocalizationProvider>
    </Homelayout>
  );
}

function googleFieldSx(text, border, theme) {
  return {
    '& .MuiInputBase-input': { color: text },
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor:
        theme.palette.mode === 'dark' ? alpha('#fff', 0.18) : theme.palette.text.secondary,
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
  };
}
