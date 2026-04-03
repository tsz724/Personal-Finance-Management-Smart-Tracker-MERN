import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { Views } from 'react-big-calendar';
import { useCalendarGridView } from './CalendarGridContext';

/** Google Calendar light header grays */
const G_WEEKDAY = '#70757a';
const G_DATE = '#3c4043';
const G_TODAY_BLUE = '#1a73e8';

/**
 * react-big-calendar `components.header`: month row = weekday abbr; week/day = Google-style DOW + date with today pill.
 */
export function CalendarWeekHeader({ date, label }) {
  const view = useCalendarGridView();

  if (view === Views.MONTH) {
    return (
      <Typography
        component="span"
        variant="caption"
        role="columnheader"
        aria-sort="none"
        sx={{
          fontWeight: 500,
          fontSize: 11,
          textTransform: 'uppercase',
          color: G_WEEKDAY,
          letterSpacing: 0.8,
          display: 'inline-block',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {label}
      </Typography>
    );
  }

  const isToday = moment(date).isSame(moment(), 'day');
  const dow = moment(date).format('ddd').toUpperCase();
  const dom = moment(date).format('D');

  /*
    RBC wraps headers in <button> or <span>; only phrasing content is valid inside a button.
    Use span + inline-flex only (no div descendants) so week/day headers render reliably.
  */
  return (
    <Box
      component="span"
      role="columnheader"
      aria-sort="none"
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        py: '10px',
        px: 0.5,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        verticalAlign: 'top',
        userSelect: 'none',
      }}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: G_WEEKDAY,
          letterSpacing: 0.6,
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {dow}
      </Typography>
      <Box
        component="span"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          lineHeight: 1,
          fontWeight: isToday ? 500 : 400,
          bgcolor: isToday ? G_TODAY_BLUE : 'transparent',
          color: isToday ? '#fff' : G_DATE,
        }}
      >
        {dom}
      </Box>
    </Box>
  );
}
