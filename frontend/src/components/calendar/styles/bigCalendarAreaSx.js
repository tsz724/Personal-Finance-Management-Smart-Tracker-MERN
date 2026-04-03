import { alpha } from '@mui/material/styles';

export function getBigCalendarAreaSx({ theme, cal }) {
  return {
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
    '& .rbc-label': { color: cal.muted, fontSize: 13 },
    /* Taller half-hour rows so short events stay readable (default RBC rows are very thin). */
    /* Enough height for one-line time + ~2 lines of title in a 30min cell */
    '& .rbc-day-slot .rbc-time-slot': {
      minHeight: 52,
    },
    '& .rbc-time-slot': {
      minHeight: 52,
    },
    /*
      RBC defaults to flex-flow: column wrap, which reflows label + title into side‑by‑side
      columns and splits "8 | :00 AM – 8:30 AM" (broken time + duplicate AM). Force a normal vertical stack.
    */
    '& .rbc-day-slot .rbc-event, & .rbc-day-slot .rbc-background-event': {
      flexFlow: 'column nowrap',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      minHeight: 24,
      padding: '3px 6px',
      fontSize: 13,
      lineHeight: 1.25,
      gap: 2,
    },
    '& .rbc-day-slot .rbc-event-label': {
      flex: '0 0 auto',
      width: '100%',
      maxWidth: '100%',
      fontSize: '0.7rem',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& .rbc-day-slot .rbc-event-content': {
      flex: '1 1 auto',
      minHeight: 0,
      width: '100%',
      maxWidth: '100%',
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      whiteSpace: 'normal',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      wordBreak: 'break-word',
    },
    '& .rbc-current-time-indicator': {
      backgroundColor: theme.palette.error.main,
    },
    '& .rbc-row-segment .rbc-event': {
      fontSize: 14,
      padding: '4px 6px',
      lineHeight: 1.25,
    },
    '& .rbc-row-segment .rbc-event-content': {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    '& .rbc-show-more': {
      color: cal.showMoreColor,
      fontWeight: 700,
    },
    '& .rbc-slot-selection': {
      backgroundColor: alpha(theme.palette.primary.main, cal.isDark ? 0.38 : 0.32),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.75)}`,
      color: cal.text,
    },
    '& .rbc-selected-cell': {
      backgroundColor: alpha(theme.palette.primary.main, cal.isDark ? 0.22 : 0.18),
    },
  };
}
