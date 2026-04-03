import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import Autocomplete from '@mui/material/Autocomplete';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import {
  getBrowserTimeZone,
  formatTimeZoneLabel,
  listIanaTimeZones,
  wallMomentToUtcIso,
} from '../../utils/timeZones';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
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
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
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

/** Google Calendar–style duration suffix, e.g. "30 mins", "1 hr", "1.5 hrs". */
function formatDurationLabel(startM, endM) {
  const minutes = endM.diff(startM, 'minute');
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  if (hours === 1) return '1 hr';
  if (hours === Math.floor(hours)) return `${hours} hrs`;
  return `${hours} hrs`;
}

/** 15-minute slots for one calendar day (12:00a–11:45p). */
function slotsFifteenMinutesForDay(dayMoment) {
  const dayStart = dayMoment.clone().startOf('day');
  const out = [];
  for (let i = 0; i < 96; i += 1) {
    out.push(dayStart.clone().add(i * 15, 'minute'));
  }
  return out;
}

/** End-time suggestions after start: each step +15m up to `count` steps (~24h). */
/** Build end-time menu from UTC `startIso` and label rows in `displayTz`. */
function endTimeSuggestionsFromUtc(startIso, displayTz, count = 96) {
  const out = [];
  const sUtc = moment.utc(startIso);
  const startWall = sUtc.clone().tz(displayTz);
  for (let i = 1; i <= count; i += 1) {
    const eUtc = sUtc.clone().add(i * 15, 'minutes');
    const endWall = eUtc.clone().tz(displayTz);
    out.push({
      endIso: eUtc.toISOString(),
      timeLabel: endWall.format('h:mma'),
      durationLabel: formatDurationLabel(startWall, endWall),
    });
  }
  return out;
}

/** e.g. "first", "second", …, "last" — matches Google-style monthly labels. */
function monthlyOrdinalLabel(m) {
  const weekday = m.day();
  const dom = m.date();
  let nth = 0;
  for (let d = 1; d <= dom; d += 1) {
    if (m.clone().date(d).day() === weekday) nth += 1;
  }
  const eom = m.daysInMonth();
  let hasLater = false;
  for (let d = dom + 1; d <= eom; d += 1) {
    if (m.clone().date(d).day() === weekday) {
      hasLater = true;
      break;
    }
  }
  const words = ['first', 'second', 'third', 'fourth'];
  if (!hasLater) return 'last';
  return words[nth - 1] || `${nth}th`;
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
    const backgroundColor = ev.eventColor || c.main;
    return {
      id: ev._recurrenceInstanceKey || ev._id,
      title: ev.title,
      start,
      end: end > start ? end : new Date(start.getTime() + 60 * 60 * 1000),
      allDay: !!ev.allDay,
      resource: ev,
      style: {
        backgroundColor,
        borderColor: ev.eventColor ? backgroundColor : c.dark,
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

  // Event panel fields (Google Calendar-like)
  const [eventColor, setEventColor] = useState(() => theme.palette.primary.main);
  const [availability, setAvailability] = useState('busy'); // busy/free
  const [visibilityKind, setVisibilityKind] = useState('default'); // default/public/private
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(30);
  const [recurrencePattern, setRecurrencePattern] = useState('none');
  const [recurrenceExtras, setRecurrenceExtras] = useState({ until: null, exceptions: [] });
  const [editingEventSnapshot, setEditingEventSnapshot] = useState(null);
  const [deleteRecurringOpen, setDeleteRecurringOpen] = useState(false);
  const [deleteScope, setDeleteScope] = useState('this');
  /** When false (new Event only), show Google-style single-line time summary. */
  const [timeComposerExpanded, setTimeComposerExpanded] = useState(true);
  /** When false (new Event only), show calendar / busy / visibility / notify as summary only. */
  const [calendarRowExpanded, setCalendarRowExpanded] = useState(true);

  const [startTimeZone, setStartTimeZone] = useState(getBrowserTimeZone);
  const [endTimeZone, setEndTimeZone] = useState(getBrowserTimeZone);
  const [separateEndTimeZone, setSeparateEndTimeZone] = useState(false);
  const [timeZoneDialogOpen, setTimeZoneDialogOpen] = useState(false);
  const [tzDraftSeparate, setTzDraftSeparate] = useState(false);
  const [tzDraftStart, setTzDraftStart] = useState('');
  const [tzDraftEnd, setTzDraftEnd] = useState('');

  const [startTimeMenuAnchor, setStartTimeMenuAnchor] = useState(null);
  const [endTimeMenuAnchor, setEndTimeMenuAnchor] = useState(null);

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
    } catch {
      toast.error('Could not load calendar');
    }
  }, [currentDate, currentView]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) {
      setStartTimeMenuAnchor(null);
      setEndTimeMenuAnchor(null);
    }
  }, [open]);

  useEffect(() => {
    if (!allDay) {
      if (!start || !end) return;
      const stz = startTimeZone || getBrowserTimeZone();
      const etz = separateEndTimeZone ? endTimeZone || stz : stz;
      setStartMoment(moment.utc(start).tz(stz));
      setEndMoment(moment.utc(end).tz(etz));
      return;
    }
    const sd = parseInputDateOnly(start, false);
    const ed = parseInputDateOnly(end, true);
    if (sd) setStartMoment(moment(sd));
    if (ed) setEndMoment(moment(ed));
  }, [start, end, allDay, startTimeZone, endTimeZone, separateEndTimeZone]);

  useEffect(() => {
    // Keep all-day end date >= start date (basic “smart compare” behavior).
    if (!allDay) return;
    if (!start || !end) return;
    const sd = parseInputDateOnly(start, false);
    const ed = parseInputDateOnly(end, true);
    if (sd && ed && ed < sd) {
      setEnd(start);
    }
  }, [allDay, start, end]);

  const calendarEvents = useMemo(() => mapApiToRbcEvents(rawEvents, palette), [rawEvents, palette]);

  const timeZoneAutocompleteOptions = useMemo(
    () =>
      listIanaTimeZones()
        .map((z) => ({ value: z, label: formatTimeZoneLabel(z) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const startTimeDaySlots = useMemo(
    () => slotsFifteenMinutesForDay(startMoment.clone().startOf('day')),
    [startMoment]
  );

  const endTimeSuggestionRows = useMemo(() => {
    if (!start || allDay) return [];
    const stz = startTimeZone || getBrowserTimeZone();
    const displayTz = separateEndTimeZone ? endTimeZone || stz : stz;
    return endTimeSuggestionsFromUtc(start, displayTz, 96);
  }, [start, allDay, separateEndTimeZone, endTimeZone, startTimeZone]);

  const meetingCalendarSlotProps = useMemo(
    () => ({
      desktopPaper: {
        sx: {
          bgcolor: cal.surfaceElevated,
          color: cal.text,
          border: `1px solid ${cal.border}`,
          boxShadow: theme.shadows[12],
          '& .MuiPickersCalendarHeader-label': { color: cal.text },
          '& .MuiPickersArrowSwitcher-button': { color: cal.text },
          '& .MuiDayCalendar-weekDayLabel': { color: cal.muted, fontSize: 12 },
          '& .MuiPickersDay-root': { color: cal.text },
          '& .MuiPickersDay-root.Mui-selected': {
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          '& .MuiPickersDay-root:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.24 : 0.16) },
        },
      },
    }),
    [cal, theme, isDark]
  );

  const meetingTimeMenuPaperSx = useMemo(
    () => ({
      maxHeight: 280,
      bgcolor: cal.surfaceElevated,
      color: cal.text,
      border: `1px solid ${cal.border}`,
      boxShadow: theme.shadows[12],
      mt: 0.5,
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      '& .MuiMenuItem-root': { typography: 'body2', py: 0.65, px: 1.5 },
      '& .MuiMenuItem-root.Mui-selected': {
        bgcolor: isDark ? alpha('#fff', 0.12) : alpha(theme.palette.primary.main, 0.12),
      },
      '& .MuiMenuItem-root.Mui-selected:hover': {
        bgcolor: isDark ? alpha('#fff', 0.16) : alpha(theme.palette.primary.main, 0.18),
      },
      '& .MuiMenuItem-root:hover': { bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04) },
    }),
    [cal, theme, isDark]
  );

  const meetingTimeChipSx = useMemo(
    () => ({
      typography: 'body2',
      fontWeight: 500,
      textTransform: 'none',
      px: 1.75,
      py: 0.75,
      minWidth: 86,
      borderRadius: 2,
      color: cal.text,
      bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
      boxShadow: 'none',
      border: '1px solid transparent',
      '&:hover': { bgcolor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.09) },
    }),
    [cal.text, isDark]
  );

  const meetingDateFieldSx = useMemo(
    () => ({
      minWidth: { xs: '100%', sm: 210 },
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
        '& fieldset': { border: 'none' },
        '&:hover fieldset': { border: 'none' },
        '&.Mui-focused fieldset': { border: 'none' },
        '&.Mui-focused': {
          boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
        },
      },
      '& .MuiInputBase-input': {
        color: cal.text,
        py: 0.85,
        px: 1.25,
        typography: 'body2',
        fontWeight: 500,
        cursor: 'pointer',
      },
    }),
    [cal.text, isDark, theme.palette.primary.main]
  );

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

  const recurrenceMenuItems = useMemo(() => {
    const d = startMoment.clone();
    const weekday = d.format('dddd');
    const ord = monthlyOrdinalLabel(d);
    return [
      { value: 'none', label: 'Does not repeat' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: `Weekly on ${weekday}` },
      { value: 'monthly', label: `Monthly on the ${ord} ${weekday}` },
      { value: 'yearly', label: `Annually on ${d.format('MMMM D')}` },
      { value: 'weekdays', label: 'Every weekday (Monday to Friday)' },
      { value: 'custom', label: 'Custom…' },
    ];
  }, [startMoment]);

  const recurrenceSummaryLabel = useMemo(
    () => recurrenceMenuItems.find((x) => x.value === recurrencePattern)?.label ?? 'Does not repeat',
    [recurrenceMenuItems, recurrencePattern]
  );

  const showCompactEventTime = !editingId && composerTab === 'event' && !timeComposerExpanded;

  const showCompactCalendarRow = !editingId && composerTab === 'event' && !calendarRowExpanded;

  const compactEventTimePrimary = useMemo(() => {
    if (!startMoment?.isValid?.() || !endMoment?.isValid?.()) return '';
    if (allDay) {
      const same = startMoment.format('YYYY-MM-DD') === endMoment.format('YYYY-MM-DD');
      if (same) return startMoment.format('dddd, MMMM D');
      return `${startMoment.format('dddd, MMMM D')} – ${endMoment.format('dddd, MMMM D')}`;
    }
    const sameCal = startMoment.format('YYYY-MM-DD') === endMoment.format('YYYY-MM-DD');
    if (sameCal) {
      return `${startMoment.format('dddd, MMMM D')}  ${startMoment.format('h:mma')} – ${endMoment.format('h:mma')}`;
    }
    return `${startMoment.format('ddd, MMM D, h:mma')} – ${endMoment.format('ddd, MMM D, h:mma')}`;
  }, [allDay, startMoment, endMoment]);

  useEffect(() => {
    // Keep internal eventType aligned with the composer tab.
    if (composerTab === 'task') setEventType('task');
    else if (composerTab === 'appointment') setEventType('meeting');
  }, [composerTab]);

  useEffect(() => {
    if (composerTab === 'task' || composerTab === 'appointment') setTimeComposerExpanded(true);
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
    setEventColor(theme.palette.primary.main);
    setAvailability('busy');
    setVisibilityKind('default');
    setReminderMinutesBefore(30);
    setRecurrencePattern('none');
    setRecurrenceExtras({ until: null, exceptions: [] });
    setEditingEventSnapshot(null);
    const br = getBrowserTimeZone();
    setStartTimeZone(br);
    setEndTimeZone(br);
    setSeparateEndTimeZone(false);
    setAllDay(!!allDayEvent);
    if (allDayEvent) {
      setStart(toInputDate(startAt));
      setEnd(toInputDate(endAt || startAt));
    } else {
      const en = endAt || new Date(new Date(startAt).getTime() + 60 * 60 * 1000);
      setStart(new Date(startAt).toISOString());
      setEnd(new Date(en).toISOString());
    }
    setTimeComposerExpanded(false);
    setCalendarRowExpanded(false);
    setOpen(true);
  };

  const openEditDialog = (rbcEvent) => {
    const ev = rbcEvent.resource;
    setTimeComposerExpanded(true);
    setCalendarRowExpanded(true);
    setEditingEventSnapshot({ ...ev, start: ev.start, end: ev.end });
    setRecurrenceExtras({
      until: ev.recurrence?.until ? new Date(ev.recurrence.until).toISOString() : null,
      exceptions: Array.isArray(ev.recurrence?.exceptions)
        ? ev.recurrence.exceptions.map((d) => new Date(d).toISOString())
        : [],
    });
    setEditingId(ev._id);
    setComposerTab(ev.eventType === 'task' ? 'task' : 'event');
    setTitle(ev.title || '');
    setLocation(ev.location || '');
    setDescription(ev.description || '');
    setGuests(Array.isArray(ev.guestEmails) ? ev.guestEmails.join(', ') : '');
    setMeetNote(ev.meetingLink || '');
    setTaskDeadline(null);
    setTaskList('My Tasks');
    setEventType(ev.eventType || 'meeting');
    setEventColor(ev.eventColor || theme.palette.primary.main);
    setAvailability(ev.availability || 'busy');
    setVisibilityKind(ev.visibilityKind || (ev.visibility === 'workspace' ? 'public' : 'default'));
    setReminderMinutesBefore(typeof ev.reminderMinutesBefore === 'number' ? ev.reminderMinutesBefore : 30);
    const rp = ev.recurrence?.pattern;
    setRecurrencePattern(rp && rp !== 'none' ? rp : 'none');
    setAllDay(!!ev.allDay);
    if (ev.allDay) {
      setStart(toInputDate(ev.start));
      setEnd(toInputDate(ev.end));
      setStartTimeZone(getBrowserTimeZone());
      setEndTimeZone(getBrowserTimeZone());
      setSeparateEndTimeZone(false);
    } else {
      const stz = ev.startTimeZone || getBrowserTimeZone();
      const sep = !!ev.separateEndTimeZone;
      const etz = sep && ev.endTimeZone ? ev.endTimeZone : stz;
      setStartTimeZone(stz);
      setEndTimeZone(etz);
      setSeparateEndTimeZone(sep);
      const siso = typeof ev.start === 'string' ? ev.start : new Date(ev.start).toISOString();
      const eiso = typeof ev.end === 'string' ? ev.end : new Date(ev.end).toISOString();
      setStart(siso);
      setEnd(eiso);
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
      const stz = startTimeZone || getBrowserTimeZone();
      const etz = separateEndTimeZone ? endTimeZone || stz : stz;
      startDate = start ? new Date(wallMomentToUtcIso(startMoment, stz)) : null;
      endDate = end ? new Date(wallMomentToUtcIso(endMoment, etz)) : null;
    }

    const mappedType =
      composerTab === 'task' ? 'task' : composerTab === 'appointment' ? 'meeting' : eventType;

    const parsedGuestEmails = guests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const mappedVisibility = visibilityKind === 'public' ? 'workspace' : 'personal';

    const recPat =
      composerTab === 'task'
        ? 'none'
        : recurrencePattern === 'custom'
          ? 'none'
          : recurrencePattern;

    const recurrencePayload =
      recPat === 'none'
        ? { pattern: 'none', until: null, exceptions: [] }
        : {
            pattern: recPat,
            until: recurrenceExtras.until,
            exceptions: recurrenceExtras.exceptions,
          };

    return {
      title: title.trim() || '(No title)',
      description: description.trim(),
      start: startDate?.toISOString(),
      end: endDate?.toISOString(),
      allDay,
      location,
      eventType: mappedType,
      visibility: mappedVisibility,
      visibilityKind,
      guestEmails: parsedGuestEmails,
      meetingLink: meetNote.trim(),
      eventColor,
      availability,
      reminderMinutesBefore,
      recurrence: recurrencePayload,
      startTimeZone: allDay ? '' : startTimeZone || getBrowserTimeZone(),
      endTimeZone: allDay
        ? ''
        : separateEndTimeZone
          ? endTimeZone || (startTimeZone || getBrowserTimeZone())
          : startTimeZone || getBrowserTimeZone(),
      separateEndTimeZone: allDay ? false : separateEndTimeZone,
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
      setEditingEventSnapshot(null);
      setRecurrenceExtras({ until: null, exceptions: [] });
      const br2 = getBrowserTimeZone();
      setStartTimeZone(br2);
      setEndTimeZone(br2);
      setSeparateEndTimeZone(false);
      load();
    } catch {
      toast.error(editingId ? 'Update failed' : 'Save failed');
    }
  };

  const closeComposerAfterDelete = () => {
    setOpen(false);
    setDeleteRecurringOpen(false);
    setEditingId(null);
    setEditingEventSnapshot(null);
    setRecurrenceExtras({ until: null, exceptions: [] });
    const br = getBrowserTimeZone();
    setStartTimeZone(br);
    setEndTimeZone(br);
    setSeparateEndTimeZone(false);
  };

  const executeDelete = async (query) => {
    try {
      await axiosInstance.delete(API_PATHS.BUSINESS.CALENDAR_EVENT(editingId), {
        ...(query ? { params: query } : {}),
      });
      toast.success('Deleted');
      closeComposerAfterDelete();
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const remove = () => {
    if (!editingId) return;
    const p = editingEventSnapshot?.recurrence?.pattern;
    if (p && p !== 'none') {
      setDeleteScope('this');
      setDeleteRecurringOpen(true);
      return;
    }
    if (!window.confirm('Delete this event?')) return;
    void executeDelete();
  };

  const confirmRecurringDelete = () => {
    const raw = editingEventSnapshot?.start;
    if (!raw) {
      toast.error('Missing event time');
      return;
    }
    const instanceStart = new Date(raw).toISOString();
    const scope =
      deleteScope === 'this' ? 'single' : deleteScope === 'following' ? 'following' : 'all';
    void executeDelete({ scope, instanceStart });
  };

  const openTimeZoneDialog = () => {
    if (allDay) return;
    setTzDraftSeparate(separateEndTimeZone);
    const stz = startTimeZone || getBrowserTimeZone();
    const etz = separateEndTimeZone ? endTimeZone || stz : stz;
    setTzDraftStart(stz);
    setTzDraftEnd(etz);
    setTimeZoneDialogOpen(true);
  };

  const confirmTimeZoneDialog = () => {
    const stz = tzDraftStart || getBrowserTimeZone();
    const etz = tzDraftSeparate ? tzDraftEnd || stz : stz;
    setSeparateEndTimeZone(tzDraftSeparate);
    setStartTimeZone(stz);
    setEndTimeZone(etz);
    if (!allDay && start && end) {
      setStart(wallMomentToUtcIso(startMoment, stz));
      setEnd(wallMomentToUtcIso(endMoment, etz));
    }
    setTimeZoneDialogOpen(false);
  };

  const applyCurrentTimeZoneDraft = () => {
    const b = getBrowserTimeZone();
    setTzDraftStart(b);
    setTzDraftEnd(b);
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

  const EVENT_COLOR_OPTIONS = [
    { value: '#4f46e5', label: 'Blue' },
    { value: '#0d9488', label: 'Teal' },
    { value: '#059669', label: 'Green' },
    { value: '#dc2626', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#e11d48', label: 'Pink' },
    { value: '#64748b', label: 'Gray' },
  ];

  const visibilityLabel =
    visibilityKind === 'public' ? 'Public' : visibilityKind === 'private' ? 'Private' : 'Default';

  /** Google-style summary under calendar row (e.g. "Default visibility"). */
  const visibilitySummaryLabel =
    visibilityKind === 'public' ? 'Public' : visibilityKind === 'private' ? 'Private' : 'Default visibility';

  const reminderLabel =
    reminderMinutesBefore === 0 ? 'at the start time' : `${reminderMinutesBefore} minutes before`;

  const reminderSummaryLabel =
    reminderMinutesBefore === 0
      ? 'Notify at the start time'
      : `Notify ${reminderMinutesBefore} minutes before`;

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
                    '& .rbc-slot-selection': {
                      backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.38 : 0.32),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.75)}`,
                      color: cal.text,
                    },
                    '& .rbc-selected-cell': {
                      backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.18),
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
                    draggableAccessor={(e) => {
                      const p = e.resource?.recurrence?.pattern;
                      return !p || p === 'none';
                    }}
                    resizableAccessor={(e) => {
                      const p = e.resource?.recurrence?.pattern;
                      return !p || p === 'none';
                    }}
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
              maxHeight: { xs: 'calc(100dvh - 24px)', sm: 'min(90dvh, 880px)' },
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              m: { xs: 1, sm: 2 },
            },
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ px: 2, pt: 1.25, flexShrink: 0 }}>
            <IconButton size="small" sx={{ color: cal.muted, mr: 0.5 }} aria-label="handle">
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={() => setOpen(false)} aria-label="close" sx={{ color: cal.muted }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              px: 3,
              pb: 2,
              WebkitOverflowScrolling: 'touch',
            }}
          >
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
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {showCompactEventTime ? (
                    <>
                      <ButtonBase
                        type="button"
                        onClick={() => setTimeComposerExpanded(true)}
                        sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: 1, py: 0.25 }}
                      >
                        <Typography variant="body1" sx={{ color: cal.text, fontWeight: 600 }}>
                          {compactEventTimePrimary}
                        </Typography>
                      </ButtonBase>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', mt: 0.25 }}>
                        {!allDay ? (
                          <>
                            <Typography
                              variant="caption"
                              component="button"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTimeZoneDialog();
                              }}
                              sx={{
                                border: 'none',
                                background: 'none',
                                p: 0,
                                cursor: 'pointer',
                                color: cal.linkColor,
                                fontWeight: 700,
                                font: 'inherit',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              Time zone
                            </Typography>
                            <Typography component="span" variant="caption" sx={{ color: cal.muted, userSelect: 'none' }}>
                              •
                            </Typography>
                          </>
                        ) : null}
                        <ButtonBase
                          type="button"
                          disabled={composerTab === 'task'}
                          onClick={() => setTimeComposerExpanded(true)}
                          sx={{
                            border: 'none',
                            background: 'transparent',
                            p: 0,
                            display: 'inline',
                            textAlign: 'left',
                            cursor: composerTab === 'task' ? 'default' : 'pointer',
                            '&.Mui-disabled': { opacity: 1, color: 'inherit' },
                          }}
                        >
                          <Typography variant="caption" sx={{ color: cal.muted, fontWeight: 500 }}>
                            {recurrenceSummaryLabel}
                          </Typography>
                        </ButtonBase>
                      </Stack>
                    </>
                  ) : null}

                  <Collapse in={!showCompactEventTime} unmountOnExit={false}>
                    <Stack spacing={0}>
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
                        minDate={moment(start, 'YYYY-MM-DD', true).isValid() ? moment(start, 'YYYY-MM-DD') : undefined}
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
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} flexWrap="wrap">
                      <DatePicker
                        label=""
                        format="dddd, MMMM D"
                        value={startMoment}
                        onChange={(v) => {
                          if (!v) return;
                          const stz = startTimeZone || getBrowserTimeZone();
                          const durMs = moment.utc(end).diff(moment.utc(start));
                          const wallStart = moment.tz(
                            {
                              year: v.year(),
                              month: v.month(),
                              date: v.date(),
                              hour: startMoment.hour(),
                              minute: startMoment.minute(),
                              second: 0,
                              millisecond: 0,
                            },
                            stz
                          );
                          const nextStartUtc = wallStart.utc().toISOString();
                          const nextEndUtc = moment.utc(nextStartUtc).add(durMs, 'ms').toISOString();
                          setStart(nextStartUtc);
                          setEnd(nextEndUtc);
                        }}
                        slots={{
                          openPickerIcon: () => null,
                        }}
                        slotProps={{
                          ...meetingCalendarSlotProps,
                          textField: {
                            size: 'small',
                            sx: meetingDateFieldSx,
                          },
                        }}
                      />

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Button
                          disableElevation
                          onClick={(e) => {
                            setEndTimeMenuAnchor(null);
                            setStartTimeMenuAnchor(e.currentTarget);
                          }}
                          sx={{
                            ...meetingTimeChipSx,
                            ...(Boolean(startTimeMenuAnchor) && {
                              boxShadow: (t) => `inset 0 -2px 0 ${t.palette.primary.main}`,
                            }),
                          }}
                        >
                          {startMoment.format('h:mma')}
                        </Button>
                        <Typography component="span" sx={{ color: cal.muted, fontWeight: 700, userSelect: 'none' }}>
                          —
                        </Typography>
                        <Button
                          disableElevation
                          onClick={(e) => {
                            setStartTimeMenuAnchor(null);
                            setEndTimeMenuAnchor(e.currentTarget);
                          }}
                          sx={{
                            ...meetingTimeChipSx,
                            minWidth: 96,
                            ...(Boolean(endTimeMenuAnchor) && {
                              boxShadow: (t) => `inset 0 -2px 0 ${t.palette.primary.main}`,
                            }),
                          }}
                        >
                          {endMoment.format('h:mma')}
                        </Button>
                      </Stack>
                    </Stack>
                  )}

                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                    <FormControlLabel
                      sx={{ m: 0 }}
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
                              const stz = startTimeZone || getBrowserTimeZone();
                              const etz = separateEndTimeZone ? endTimeZone || stz : stz;
                              setStart(wallMomentToUtcIso(startMoment, stz));
                              setEnd(wallMomentToUtcIso(endMoment, etz));
                            }
                          }}
                          sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                        />
                      }
                      label={<Typography variant="body2">All day</Typography>}
                    />
                    {!allDay ? (
                      <Typography
                        variant="caption"
                        component="button"
                        type="button"
                        onClick={openTimeZoneDialog}
                        sx={{
                          border: 'none',
                          background: 'none',
                          p: 0,
                          cursor: 'pointer',
                          color: cal.linkColor,
                          fontWeight: 700,
                          font: 'inherit',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Time zone
                      </Typography>
                    ) : null}
                  </Stack>

                  {composerTab !== 'task' ? (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <Select
                        value={recurrenceMenuItems.some((x) => x.value === recurrencePattern) ? recurrencePattern : 'none'}
                        displayEmpty
                        IconComponent={ExpandMoreIcon}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'custom') {
                            toast('Custom recurrence is not available yet.');
                            return;
                          }
                          setRecurrencePattern(v);
                        }}
                        renderValue={(v) =>
                          recurrenceMenuItems.find((x) => x.value === v)?.label ?? 'Does not repeat'
                        }
                        sx={{
                          color: cal.text,
                          borderRadius: 2,
                          bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: 'none' },
                          '& .MuiSelect-select': { py: 1, px: 1.5, display: 'flex', alignItems: 'center' },
                          '& .MuiSelect-icon': { color: cal.muted },
                          '&.Mui-focused': {
                            boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              ...meetingTimeMenuPaperSx,
                              maxHeight: 320,
                            },
                          },
                        }}
                      >
                        {recurrenceMenuItems.map((item) => (
                          <MenuItem key={item.value} value={item.value}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : null}
                    </Stack>
                  </Collapse>
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
                      placeholder="Add Google Meet video conferencing"
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
                    placeholder="Add description or Google Drive attachment"
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
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {showCompactCalendarRow ? (
                      <ButtonBase
                        type="button"
                        onClick={() => setCalendarRowExpanded(true)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          borderRadius: 1,
                          py: 0.25,
                          alignItems: 'stretch',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body1" sx={{ color: cal.text, fontWeight: 600 }}>
                            {displayName}
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              flexShrink: 0,
                              bgcolor: eventColor || theme.palette.primary.main,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: cal.muted, fontWeight: 500, display: 'block', mt: 0.25 }}>
                          {availability === 'busy' ? 'Busy' : 'Free'} • {visibilitySummaryLabel} • {reminderSummaryLabel}
                        </Typography>
                      </ButtonBase>
                    ) : null}

                    <Collapse in={!showCompactCalendarRow} unmountOnExit={false}>
                      <Stack spacing={1.25} sx={{ pt: showCompactCalendarRow ? 0 : 0 }}>
                        {!showCompactCalendarRow ? (
                          <>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="body1" sx={{ color: cal.text, fontWeight: 600 }}>
                                {displayName}
                              </Typography>
                              <Box
                                component="span"
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 999,
                                  flexShrink: 0,
                                  bgcolor: eventColor || theme.palette.primary.main,
                                }}
                              />
                            </Stack>
                            <Typography variant="caption" sx={{ color: cal.muted, fontWeight: 500, display: 'block' }}>
                              {availability === 'busy' ? 'Busy' : 'Free'} • {visibilitySummaryLabel} • {reminderSummaryLabel}
                            </Typography>
                          </>
                        ) : null}

                        <FormControl fullWidth size="small" sx={{ ...googleFieldSx(cal.text, cal.border, theme) }}>
                          <InputLabel>Event color</InputLabel>
                          <Select
                            label="Event color"
                            value={eventColor}
                            onChange={(e) => setEventColor(e.target.value)}
                          >
                            {EVENT_COLOR_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: opt.value }} />
                                  <Typography variant="body2">{opt.label}</Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={{ ...googleFieldSx(cal.text, cal.border, theme) }}>
                          <InputLabel>Busy / Free</InputLabel>
                          <Select
                            label="Busy / Free"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                          >
                            <MenuItem value="busy">Busy</MenuItem>
                            <MenuItem value="free">Free</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={{ ...googleFieldSx(cal.text, cal.border, theme) }}>
                          <InputLabel>Visibility</InputLabel>
                          <Select
                            label="Visibility"
                            value={visibilityKind}
                            onChange={(e) => setVisibilityKind(e.target.value)}
                          >
                            <MenuItem value="default">Default</MenuItem>
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small" sx={{ ...googleFieldSx(cal.text, cal.border, theme) }}>
                          <InputLabel>Notifications</InputLabel>
                          <Select
                            label="Notifications"
                            value={reminderMinutesBefore}
                            onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                          >
                            <MenuItem value={30}>30 minutes before</MenuItem>
                            <MenuItem value={15}>15 minutes before</MenuItem>
                            <MenuItem value={10}>10 minutes before</MenuItem>
                            <MenuItem value={5}>5 minutes before</MenuItem>
                            <MenuItem value={0}>At start time</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Collapse>
                  </Box>
                </Stack>
              ) : composerTab === 'task' ? (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {displayName}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          flexShrink: 0,
                          bgcolor: theme.palette.primary.main,
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: cal.muted, fontWeight: 500 }}>
                      Free • Private
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <CalendarMonthOutlinedIcon sx={{ color: cal.muted, mt: 0.75 }} />
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {displayName}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        flexShrink: 0,
                        bgcolor: theme.palette.primary.main,
                      }}
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              px: 3,
              pb: 2,
              pt: 0,
              bgcolor: cal.surfaceElevated,
              borderTop: `1px solid ${cal.border}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ pt: 1.5 }}>
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

        <Dialog
          open={deleteRecurringOpen}
          onClose={() => setDeleteRecurringOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: cal.surfaceElevated,
              color: cal.text,
              border: `1px solid ${cal.border}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', pb: 1 }}>Delete recurring event</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={deleteScope}
              onChange={(e) => setDeleteScope(e.target.value)}
              sx={{ gap: 0.5 }}
            >
              <FormControlLabel
                value="this"
                control={
                  <Radio
                    size="small"
                    sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                  />
                }
                label={<Typography variant="body2">This event</Typography>}
                sx={{ color: cal.text, alignItems: 'center', m: 0 }}
              />
              <FormControlLabel
                value="following"
                control={
                  <Radio
                    size="small"
                    sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                  />
                }
                label={<Typography variant="body2">This and following events</Typography>}
                sx={{ color: cal.text, alignItems: 'center', m: 0 }}
              />
              <FormControlLabel
                value="all"
                control={
                  <Radio
                    size="small"
                    sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                  />
                }
                label={<Typography variant="body2">All events</Typography>}
                sx={{ color: cal.text, alignItems: 'center', m: 0 }}
              />
            </RadioGroup>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
            <Button
              onClick={() => setDeleteRecurringOpen(false)}
              sx={{ color: cal.muted, textTransform: 'none', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmRecurringDelete}
              sx={{
                borderRadius: 999,
                px: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                backgroundColor: cal.saveBtnBg,
                color: cal.saveBtnColor,
                boxShadow: 'none',
                '&:hover': { backgroundColor: cal.saveBtnHoverBg, boxShadow: 'none' },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={timeZoneDialogOpen}
          onClose={() => setTimeZoneDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              bgcolor: cal.surfaceElevated,
              color: cal.text,
              border: `1px solid ${cal.border}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', pb: 1 }}>Event time zone</DialogTitle>
          <DialogContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={tzDraftSeparate}
                  size="small"
                  onChange={(e) => {
                    const c = e.target.checked;
                    setTzDraftSeparate(c);
                    if (!c) setTzDraftEnd(tzDraftStart);
                  }}
                  sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                />
              }
              label={<Typography variant="body2">Use separate start and end time zones</Typography>}
              sx={{ color: cal.text, mb: 1.5, alignItems: 'center' }}
            />
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                <Autocomplete
                  size="small"
                  options={timeZoneAutocompleteOptions}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(a, b) => !!a && !!b && a.value === b.value}
                  value={timeZoneAutocompleteOptions.find((o) => o.value === tzDraftStart) ?? null}
                  onChange={(_, v) => {
                    if (!v) return;
                    setTzDraftStart(v.value);
                    if (!tzDraftSeparate) setTzDraftEnd(v.value);
                  }}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Event start time zone"
                      InputLabelProps={params.InputLabelProps}
                      sx={googleFieldSx(cal.text, cal.border, theme)}
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor: cal.surfaceElevated,
                        color: cal.text,
                        border: `1px solid ${cal.border}`,
                      },
                    },
                  }}
                />
                <Autocomplete
                  size="small"
                  disabled={!tzDraftSeparate}
                  options={timeZoneAutocompleteOptions}
                  getOptionLabel={(o) => o.label}
                  isOptionEqualToValue={(a, b) => !!a && !!b && a.value === b.value}
                  value={
                    timeZoneAutocompleteOptions.find(
                      (o) => o.value === (tzDraftSeparate ? tzDraftEnd : tzDraftStart)
                    ) ?? null
                  }
                  onChange={(_, v) => v && setTzDraftEnd(v.value)}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Event end time zone"
                      InputLabelProps={params.InputLabelProps}
                      sx={{
                        ...googleFieldSx(cal.text, cal.border, theme),
                        ...(!tzDraftSeparate && { opacity: 0.55 }),
                      }}
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor: cal.surfaceElevated,
                        color: cal.text,
                        border: `1px solid ${cal.border}`,
                      },
                    },
                  }}
                />
              </Stack>
              <IconButton
                size="small"
                disabled={!tzDraftSeparate}
                onClick={() => {
                  const a = tzDraftStart;
                  setTzDraftStart(tzDraftEnd);
                  setTzDraftEnd(a);
                }}
                sx={{ color: cal.muted, mt: 3, flexShrink: 0 }}
                aria-label="Swap time zones"
              >
                <ImportExportIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={applyCurrentTimeZoneDraft}
              sx={{ color: cal.linkColor, textTransform: 'none', fontWeight: 700 }}
            >
              Use current time zone
            </Button>
            <Box sx={{ flex: 1, minWidth: 8 }} />
            <Button
              onClick={() => setTimeZoneDialogOpen(false)}
              sx={{ color: cal.muted, textTransform: 'none', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmTimeZoneDialog}
              sx={{
                borderRadius: 999,
                px: 2.5,
                textTransform: 'none',
                fontWeight: 800,
                backgroundColor: cal.saveBtnBg,
                color: cal.saveBtnColor,
                boxShadow: 'none',
                '&:hover': { backgroundColor: cal.saveBtnHoverBg, boxShadow: 'none' },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          anchorEl={startTimeMenuAnchor}
          open={Boolean(startTimeMenuAnchor) && open && !allDay}
          onClose={() => setStartTimeMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: { ...meetingTimeMenuPaperSx, width: 152 },
            },
          }}
          MenuListProps={{ dense: true, autoFocusItem: true }}
        >
          {startTimeDaySlots.map((m) => {
            const selected =
              m.clone().startOf('day').isSame(startMoment.clone().startOf('day')) &&
              m.format('HH:mm') === startMoment.format('HH:mm');
            return (
              <MenuItem
                key={m.valueOf()}
                selected={selected}
                onClick={() => {
                  const stzig = startTimeZone || getBrowserTimeZone();
                  const durMs = moment.utc(end).diff(moment.utc(start));
                  const wallStart = moment.tz(
                    {
                      year: m.year(),
                      month: m.month(),
                      date: m.date(),
                      hour: m.hour(),
                      minute: m.minute(),
                      second: 0,
                      millisecond: 0,
                    },
                    stzig
                  );
                  const nextStartUtc = wallStart.utc().toISOString();
                  const nextEndUtc = moment
                    .utc(nextStartUtc)
                    .add(Math.max(durMs, 15 * 60 * 1000), 'ms')
                    .toISOString();
                  setStart(nextStartUtc);
                  setEnd(nextEndUtc);
                  setStartTimeMenuAnchor(null);
                }}
              >
                {m.format('h:mma')}
              </MenuItem>
            );
          })}
        </Menu>

        <Menu
          anchorEl={endTimeMenuAnchor}
          open={Boolean(endTimeMenuAnchor) && open && !allDay}
          onClose={() => setEndTimeMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: { ...meetingTimeMenuPaperSx, minWidth: 232 },
            },
          }}
          MenuListProps={{ dense: true, autoFocusItem: true }}
        >
          {endTimeSuggestionRows.map(({ endIso, timeLabel, durationLabel }) => {
            const selected = end === endIso;
            return (
              <MenuItem
                key={endIso}
                selected={selected}
                onClick={() => {
                  const startUtcMs = moment.utc(start).valueOf();
                  let next = endIso;
                  if (moment.utc(next).valueOf() <= startUtcMs) {
                    next = moment.utc(startUtcMs + 15 * 60 * 1000).toISOString();
                  }
                  setEnd(next);
                  setEndTimeMenuAnchor(null);
                }}
              >
                {`${timeLabel} (${durationLabel})`}
              </MenuItem>
            );
          })}
        </Menu>
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
