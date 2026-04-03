import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { alpha, useTheme } from '@mui/material/styles';
import moment from 'moment';
import toast from 'react-hot-toast';
import { getBrowserTimeZone, wallMomentToUtcIso } from '../../../utils/timeZones';
import { EVENT_COLOR_OPTIONS } from '../constants';
import { googleFieldSx } from '../styles/fieldSx';

/** Google-style create / edit event, task, or appointment (shell + form + footer). */
export function EventComposerDialog({ cal, composer }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
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
    endTimeZone,
    separateEndTimeZone,
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
  } = composer;

  return (
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
  );
}
