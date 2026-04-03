import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { useTheme, alpha } from '@mui/material/styles';
import { useUserAuth } from '../../../hooks/useUserAuth';
import { UserContext } from '../../../context/UserContext';
import axiosInstance from '../../../utils/axiosInstance';
import { API_PATHS } from '../../../utils/apiPaths';
import toast from 'react-hot-toast';
import {
  getBrowserTimeZone,
  formatTimeZoneLabel,
  listIanaTimeZones,
  wallMomentToUtcIso,
} from '../../../utils/timeZones';
import { Views } from '../calendarDnD';
import { getCalendarTokens } from '../calendarTokens';
import { mapApiToRbcEvents } from '../mapApiToRbcEvents';
import {
  getFetchRange,
  toInputDate,
  parseInputDateOnly,
  slotsFifteenMinutesForDay,
  endTimeSuggestionsFromUtc,
  monthlyOrdinalLabel,
} from '../dateUtils';

function sortRawEventsByStart(list) {
  return [...list].sort((a, b) => new Date(a.start) - new Date(b.start));
}

function isRecurrenceSeriesSnapshot(snap) {
  const p = snap?.recurrence?.pattern;
  return !!(p && p !== 'none');
}

/** Calendar feature controller (data, grid interactions, composer). */
export function useCalendarPage() {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  // Google-style calendar is a light surface even if the rest of the app uses dark mode.
  const cal = useMemo(() => getCalendarTokens(theme, { forceLight: true }), [theme]);
  const isDark = cal.isDark;

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
  const [editRecurringMoveOpen, setEditRecurringMoveOpen] = useState(false);
  const [editRecurringMoveScope, setEditRecurringMoveScope] = useState('this');
  const [pendingRecurringMove, setPendingRecurringMove] = useState(null);
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

  const calendarEvents = useMemo(
    () => mapApiToRbcEvents(rawEvents, palette, { theme, pastelFill: !cal.isDark }),
    [rawEvents, palette, theme, cal.isDark]
  );

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
    const recPatEffective =
      composerTab === 'task'
        ? 'none'
        : recurrencePattern === 'custom'
          ? 'none'
          : recurrencePattern;

    try {
      if (editingId) {
        const { data } = await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(editingId), payload);
        toast.success('Saved');
        const wasRec = isRecurrenceSeriesSnapshot(editingEventSnapshot);
        const nowRec = !!(payload.recurrence?.pattern && payload.recurrence.pattern !== 'none');
        if (!wasRec && !nowRec) {
          setRawEvents((prev) =>
            sortRawEventsByStart(
              prev.map((row) =>
                String(row._id) === String(editingId)
                  ? {
                      ...row,
                      ...data,
                      start: data.start,
                      end: data.end,
                      _recurrenceInstanceKey: row._recurrenceInstanceKey || String(data._id),
                    }
                  : row
              )
            )
          );
        } else {
          load();
        }
      } else {
        const { data } = await axiosInstance.post(API_PATHS.BUSINESS.CALENDAR, payload);
        toast.success('Saved');
        if (recPatEffective === 'none') {
          setRawEvents((prev) =>
            sortRawEventsByStart([...prev, { ...data, _recurrenceInstanceKey: String(data._id) }])
          );
        } else {
          load();
        }
      }
      setOpen(false);
      setEditingId(null);
      setEditingEventSnapshot(null);
      setRecurrenceExtras({ until: null, exceptions: [] });
      const br2 = getBrowserTimeZone();
      setStartTimeZone(br2);
      setEndTimeZone(br2);
      setSeparateEndTimeZone(false);
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
      const rec = isRecurrenceSeriesSnapshot(editingEventSnapshot);
      const scope = query?.scope;
      if (!rec || !query) {
        setRawEvents((prev) => prev.filter((row) => String(row._id) !== String(editingId)));
      } else if (scope === 'all') {
        setRawEvents((prev) => prev.filter((row) => String(row._id) !== String(editingId)));
      } else {
        load();
      }
      closeComposerAfterDelete();
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

  const closeRecurringMoveDialog = () => {
    setEditRecurringMoveOpen(false);
    setPendingRecurringMove(null);
  };

  const confirmRecurringMove = async () => {
    if (!pendingRecurringMove) return;
    const { eventId, instanceStartIso, nextStart, nextEnd, isAllDay, resourceSnapshot } =
      pendingRecurringMove;
    const scope =
      editRecurringMoveScope === 'this'
        ? 'single'
        : editRecurringMoveScope === 'following'
          ? 'following'
          : 'all';
    const ev = resourceSnapshot;
    const payload = {
      title: String(ev.title || '').trim() || 'Untitled',
      description: ev.description || '',
      start: nextStart,
      end: nextEnd,
      allDay: typeof isAllDay === 'boolean' ? isAllDay : !!ev.allDay,
      location: ev.location || '',
      eventType: ev.eventType || 'meeting',
      visibility: ev.visibility || 'personal',
    };
    try {
      await axiosInstance.put(API_PATHS.BUSINESS.CALENDAR_EVENT(eventId), payload, {
        params: { scope, instanceStart: instanceStartIso },
      });
      toast.success('Updated');
      closeRecurringMoveDialog();
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update event');
    }
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
        setRawEvents((prev) =>
          sortRawEventsByStart(
            prev.map((row) =>
              String(row._id) === String(id)
                ? {
                    ...row,
                    start: new Date(s.toISOString()),
                    end: new Date(normalizedEnd.toISOString()),
                    allDay: payload.allDay,
                  }
                : row
            )
          )
        );
      } catch (e) {
        toast.error(e.response?.data?.message || 'Could not update event');
      }
    },
    []
  );

  const beginRecurringMoveFlow = useCallback((event, start, end, isAllDay) => {
    const ev = event?.resource || {};
    const s = new Date(start);
    const en = new Date(end);
    if (!Number.isFinite(s.getTime()) || !Number.isFinite(en.getTime())) return;
    const normalizedEnd = en <= s ? new Date(s.getTime() + 60 * 60 * 1000) : en;
    const instanceStart = new Date(ev.start != null ? ev.start : event.start);
    setPendingRecurringMove({
      eventId: ev._id,
      instanceStartIso: instanceStart.toISOString(),
      nextStart: s.toISOString(),
      nextEnd: normalizedEnd.toISOString(),
      isAllDay,
      resourceSnapshot: { ...ev },
    });
    setEditRecurringMoveScope('this');
    setEditRecurringMoveOpen(true);
  }, []);

  const onEventDrop = useCallback(
    ({ event, start, end, allDay: isAllDay }) => {
      const p = event?.resource?.recurrence?.pattern;
      if (p && p !== 'none') {
        beginRecurringMoveFlow(event, start, end, isAllDay);
        return;
      }
      updateEventTimes(event, start, end, isAllDay);
    },
    [beginRecurringMoveFlow, updateEventTimes]
  );

  const onEventResize = useCallback(
    ({ event, start, end, allDay: isAllDay }) => {
      const p = event?.resource?.recurrence?.pattern;
      if (p && p !== 'none') {
        beginRecurringMoveFlow(event, start, end, isAllDay);
        return;
      }
      updateEventTimes(event, start, end, isAllDay);
    },
    [beginRecurringMoveFlow, updateEventTimes]
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


  return {
    cal,
    theme,
    isDark,
    user,
    displayName,
    sidebar: {
      currentDate,
      setCurrentDate,
      myCalOpen,
      setMyCalOpen,
      otherCalOpen,
      setOtherCalOpen,
      onCreate: () => openNewDialog(new Date(), new Date(Date.now() + 3600000), false),
    },
    grid: {
      currentView,
      setCurrentView,
      currentDate,
      setCurrentDate,
      headerLabel,
      navigateCal,
      calendarEvents,
      onSelectSlot,
      onSelectEvent,
      eventStyleGetter,
      onEventDrop,
      onEventResize,
    },
    composer: {
      open,
      setOpen,
      editingId,
      title,
      setTitle,
      composerTab,
      setComposerTab,
      start,
      end,
      setStart,
      setEnd,
      startMoment,
      endMoment,
      allDay,
      setAllDay,
      location,
      setLocation,
      description,
      setDescription,
      guests,
      setGuests,
      meetNote,
      setMeetNote,
      taskDeadline,
      setTaskDeadline,
      taskList,
      setTaskList,
      eventColor,
      setEventColor,
      availability,
      setAvailability,
      visibilityKind,
      setVisibilityKind,
      reminderMinutesBefore,
      setReminderMinutesBefore,
      recurrencePattern,
      setRecurrencePattern,
      startTimeZone,
      setStartTimeZone,
      endTimeZone,
      setEndTimeZone,
      separateEndTimeZone,
      setSeparateEndTimeZone,
      timeComposerExpanded,
      setTimeComposerExpanded,
      calendarRowExpanded,
      setCalendarRowExpanded,
      startTimeMenuAnchor,
      setStartTimeMenuAnchor,
      endTimeMenuAnchor,
      setEndTimeMenuAnchor,
      meetingCalendarSlotProps,
      meetingTimeMenuPaperSx,
      meetingTimeChipSx,
      meetingDateFieldSx,
      primaryActionLabel,
      save,
      remove,
      showCompactEventTime,
      showCompactCalendarRow,
      compactEventTimePrimary,
      recurrenceSummaryLabel,
      recurrenceMenuItems,
      openTimeZoneDialog,
      visibilitySummaryLabel,
      reminderSummaryLabel,
      displayName,
    },
    deleteRecurring: {
      open: deleteRecurringOpen,
      setOpen: setDeleteRecurringOpen,
      scope: deleteScope,
      setScope: setDeleteScope,
      onConfirm: confirmRecurringDelete,
    },
    editRecurringMove: {
      open: editRecurringMoveOpen,
      scope: editRecurringMoveScope,
      setScope: setEditRecurringMoveScope,
      onConfirm: confirmRecurringMove,
      onClose: closeRecurringMoveDialog,
    },
    timeZoneDialog: {
      open: timeZoneDialogOpen,
      onClose: () => setTimeZoneDialogOpen(false),
      tzDraftSeparate,
      setTzDraftSeparate,
      tzDraftStart,
      setTzDraftStart,
      tzDraftEnd,
      setTzDraftEnd,
      timeZoneAutocompleteOptions,
      onConfirm: confirmTimeZoneDialog,
      applyCurrent: applyCurrentTimeZoneDraft,
    },
    timeMenus: {
      startTimeDaySlots,
      endTimeSuggestionRows,
      meetingTimeMenuPaperSx,
      startTimeMenuAnchor,
      endTimeMenuAnchor,
      setStartTimeMenuAnchor,
      setEndTimeMenuAnchor,
      setStart,
      setEnd,
      start,
      end,
      startMoment,
      startTimeZone,
      dialogOpen: open,
      allDay,
    },
  };
}
