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
      padding: 0,
      fontWeight: 500,
      fontSize: 11,
      textTransform: 'none',
      color: cal.muted,
      borderBottom: `1px solid ${cal.border}`,
      textAlign: 'center',
      /* Match RBC: do not shrink columns (was flex-shrink 1 and collapsed week headers). */
      flex: '1 0 0%',
      minWidth: 0,
      ...(!cal.isDark && { backgroundColor: '#fff' }),
    },
    '& .rbc-header .rbc-button-link': {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      textDecoration: 'none',
      padding: 0,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
    },
    /* RBC uses border-left between header cells; keep divider color on-theme (Google-style grid). */
    '& .rbc-header + .rbc-header': {
      borderLeft: `1px solid ${cal.border}`,
    },
    /*
      RBC sets .rbc-header { min-height: 0; overflow: hidden } so flex items can shrink and clip
      custom two-line headers (today pill cut in half). Keep week/day headers sized to content.
    */
    '& .rbc-time-header-content > .rbc-row.rbc-time-header-cell': {
      flexShrink: 0,
      minHeight: 'unset',
      overflow: 'visible',
      alignItems: 'stretch',
    },
    '& .rbc-time-header-cell .rbc-header': {
      whiteSpace: 'normal',
      overflow: 'visible',
      alignSelf: 'stretch',
      /* Override RBC min-height: 0 (flex shrink) so the date pill is not clipped. */
      minHeight: 'auto',
      boxSizing: 'border-box',
    },
    '& .rbc-time-header-cell .rbc-header .rbc-button-link': {
      overflow: 'visible',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'auto',
    },
    '& .rbc-time-header-cell .rbc-header.rbc-today': {
      ...(!cal.isDark && { backgroundColor: '#fff' }),
    },
    '& .rbc-month-header .rbc-header + .rbc-header': {
      borderLeft: `1px solid ${cal.border}`,
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
    '& .rbc-month-view .rbc-day-bg.rbc-today': {
      backgroundColor: cal.isDark
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.primary.main, 0.08),
    },
    '& .rbc-time-view .rbc-day-bg.rbc-today': {
      ...(!cal.isDark && { backgroundColor: '#fff' }),
    },
    '& .rbc-time-header-content .rbc-header': {
      borderBottom: `1px solid ${cal.border}`,
    },
    '& .rbc-time-header': {
      overflow: 'visible',
    },
    '& .rbc-time-header-content': {
      overflow: 'visible',
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
    /* 15-minute rows (4/hour); ~same pixel height per hour as former 2×30min × 52px. */
    '& .rbc-day-slot .rbc-time-slot': {
      minHeight: 26,
    },
    '& .rbc-time-slot': {
      minHeight: 26,
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
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
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
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
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
