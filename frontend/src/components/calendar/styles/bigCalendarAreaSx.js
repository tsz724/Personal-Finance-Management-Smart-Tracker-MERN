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
      padding: '6px 4px',
      fontWeight: 600,
      fontSize: 11,
      textTransform: 'none',
      color: cal.muted,
      borderBottom: `1px solid ${cal.border}`,
      ...(!cal.isDark && { backgroundColor: '#fff' }),
    },
    '& .rbc-header .rbc-button-link': {
      display: 'block',
      width: '100%',
      color: 'inherit',
      textDecoration: 'none',
    },
    '& .rbc-month-view, & .rbc-time-view': {
      border: `1px solid ${cal.border}`,
      borderRadius: 1,
      overflow: 'hidden',
      ...(!cal.isDark && { backgroundColor: '#fff' }),
    },
    '& .rbc-day-bg + .rbc-day-bg, & .rbc-time-header-content, & .rbc-day-slot .rbc-time-slot': {
      borderColor: cal.border,
    },
    '& .rbc-off-range-bg': {
      backgroundColor: cal.offRangeBg,
    },
    '& .rbc-today': {
      backgroundColor: cal.isDark
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.primary.main, 0.06),
    },
    '& .rbc-time-header-content .rbc-header': {
      borderBottom: `1px solid ${cal.border}`,
    },
    '& .rbc-time-content, & .rbc-day-slot .rbc-background-event': {
      borderTop: `1px solid ${cal.border}`,
    },
    ...(!cal.isDark && {
      '& .rbc-time-content': { backgroundColor: '#fff' },
      '& .rbc-time-gutter': { backgroundColor: '#fff' },
      '& .rbc-time-header': { backgroundColor: '#fff' },
      '& .rbc-month-view .rbc-day-bg': { backgroundColor: '#fff' },
    }),
    '& .rbc-label': { color: cal.muted, fontSize: 12 },
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
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      minHeight: 22,
      padding: '3px 6px',
      lineHeight: 1.25,
      gap: 0,
      color: 'inherit',
    },
    '& .rbc-day-slot .rbc-event-label': {
      display: 'none',
    },
    '& .rbc-day-slot .rbc-event-content': {
      flex: '1 1 auto',
      minWidth: 0,
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: 'inherit',
      whiteSpace: 'normal',
      overflow: 'hidden',
    },
    '& .rbc-current-time-indicator': {
      backgroundColor: '#ea4335',
      height: 2,
    },
    /* Month / agenda row chips — same visual weight as week view (no tiny grey text). */
    '& .rbc-row-segment .rbc-event': {
      padding: '3px 6px',
      lineHeight: 1.25,
      color: 'inherit',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'flex-start',
      gap: 0,
    },
    '& .rbc-row-segment .rbc-event-label': {
      display: 'none',
    },
    '& .rbc-row-segment .rbc-event-content': {
      flex: '1 1 auto',
      minWidth: 0,
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.25,
      color: 'inherit',
      whiteSpace: 'normal',
      overflow: 'hidden',
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
