import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import { Views } from 'react-big-calendar';
import { useCalendarGridView } from './CalendarGridContext';

/**
 * react-big-calendar `components.header`: month row = weekday abbr; week/day = Google-style DOW + date with today pill.
 */
export function CalendarWeekHeader({ date, label }) {
  const theme = useTheme();
  const view = useCalendarGridView();

  if (view === Views.MONTH) {
    return (
      <Typography
        component="span"
        variant="caption"
        role="columnheader"
        aria-sort="none"
        sx={{
          fontWeight: 600,
          fontSize: 11,
          textTransform: 'uppercase',
          color: 'text.secondary',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
    );
  }

  const isToday = moment(date).isSame(moment(), 'day');
  const dow = moment(date).format('ddd').toUpperCase();
  const dom = moment(date).format('D');

  return (
    <Box
      component="span"
      role="columnheader"
      aria-sort="none"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.25,
        py: 0.5,
        userSelect: 'none',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: 0.4,
          lineHeight: 1,
        }}
      >
        {dow}
      </Typography>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: isToday ? 600 : 400,
          bgcolor: isToday ? theme.palette.primary.main : 'transparent',
          color: isToday ? theme.palette.primary.contrastText : 'text.primary',
        }}
      >
        {dom}
      </Box>
    </Box>
  );
}
