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
    '& .rbc-label': { color: cal.muted },
    '& .rbc-current-time-indicator': {
      backgroundColor: theme.palette.error.main,
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
