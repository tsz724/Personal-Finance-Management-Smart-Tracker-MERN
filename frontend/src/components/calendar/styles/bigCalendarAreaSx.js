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
    /* Half-hour rows; single-line “Title 8:00 AM – 8:30 AM” fits comfortably. */
    '& .rbc-day-slot .rbc-time-slot': {
      minHeight: 52,
    },
    '& .rbc-time-slot': {
      minHeight: 52,
    },
    /*
      Custom `components.event` renders “Title, 9a” inside .rbc-event-content only.
      Hide RBC’s separate .rbc-event-label so time is not duplicated.
    */
    '& .rbc-day-slot .rbc-event, & .rbc-day-slot .rbc-background-event': {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: 24,
      padding: '6px 10px',
      lineHeight: 1.25,
      gap: 0,
      color: '#fff',
    },
    '& .rbc-day-slot .rbc-event-label': {
      display: 'none',
    },
    '& .rbc-day-slot .rbc-event-content': {
      flex: '1 1 auto',
      minWidth: 0,
      fontSize: '0.875rem',
      fontWeight: 800,
      lineHeight: 1.25,
      color: 'inherit',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& .rbc-current-time-indicator': {
      backgroundColor: theme.palette.error.main,
    },
    /* Month / agenda row chips — same visual weight as week view (no tiny grey text). */
    '& .rbc-row-segment .rbc-event': {
      padding: '5px 8px',
      lineHeight: 1.25,
      color: '#fff',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      gap: 0,
    },
    '& .rbc-row-segment .rbc-event-label': {
      display: 'none',
    },
    '& .rbc-row-segment .rbc-event-content': {
      flex: '1 1 auto',
      minWidth: 0,
      fontSize: '0.875rem',
      fontWeight: 800,
      lineHeight: 1.25,
      color: 'inherit',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& .rbc-agenda-view .rbc-event-label': {
      display: 'none',
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
