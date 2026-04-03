import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { applyTimeGridScroll, getCalendarScrollToTime } from './calendarScroll';
import { DnDCalendar, Views, calendarLocalizer } from './calendarDnD';
import { CalendarEventChip } from './CalendarEventChip';
import { CalendarGridViewContext } from './CalendarGridContext';
import { CalendarWeekHeader } from './CalendarWeekHeader';
import { getBigCalendarAreaSx } from './styles/bigCalendarAreaSx';

export function CalendarGridPanel({
  cal,
  theme,
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
}) {
  const areaSx = getBigCalendarAreaSx({ theme, cal });
  const calendarRootRef = useRef(null);

  const scrollToTime = useMemo(
    () => getCalendarScrollToTime(currentView, currentDate, calendarEvents),
    [currentView, currentDate, calendarEvents]
  );

  useLayoutEffect(() => {
    const run = () =>
      applyTimeGridScroll(calendarRootRef.current, currentView, currentDate, calendarEvents);
    run();
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [currentView, currentDate, calendarEvents]);

  return (
    <Box sx={{ flex: 1, py: { xs: 1, md: 1.5 }, px: 0 }}>
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

        <Box ref={calendarRootRef} sx={areaSx}>
          <CalendarGridViewContext.Provider value={currentView}>
            <DnDCalendar
              localizer={calendarLocalizer}
              components={{ event: CalendarEventChip, header: CalendarWeekHeader }}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={currentView}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              date={currentDate}
              scrollToTime={scrollToTime}
              enableAutoScroll
              onNavigate={(d) => setCurrentDate(d)}
              onView={(v) => setCurrentView(v)}
              toolbar={false}
              onSelectSlot={onSelectSlot}
              onSelectEvent={onSelectEvent}
              selectable
              popup
              draggableAccessor={() => true}
              resizableAccessor={() => true}
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
          </CalendarGridViewContext.Provider>
        </Box>
      </Paper>
    </Box>
  );
}
