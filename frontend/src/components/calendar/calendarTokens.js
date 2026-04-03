import { alpha } from '@mui/material/styles';

/** Semantic palette for calendar shell + react-big-calendar chrome (not MUI theme itself). */
export function getCalendarTokens(theme) {
  const isDark = theme.palette.mode === 'dark';
  if (isDark) {
    return {
      isDark,
      surface: '#1f1f1f',
      surfaceElevated: '#2a2a2a',
      border: alpha('#fff', 0.08),
      text: alpha('#fff', 0.92),
      muted: alpha('#fff', 0.6),
      offRangeBg: alpha('#000', 0.25),
      infoBoxBg: alpha('#000', 0.2),
      standardUnderline: alpha('#fff', 0.12),
      appointmentText: alpha('#fff', 0.86),
      selectHoverOutline: alpha('#fff', 0.18),
      holidayCheck: alpha('#fff', 0.25),
      createBtnBg: alpha('#aecbfa', 0.25),
      createBtnColor: '#aecbfa',
      createBtnHoverBg: alpha('#aecbfa', 0.34),
      saveBtnBg: alpha('#aecbfa', 0.85),
      saveBtnColor: '#062e6f',
      saveBtnHoverBg: '#aecbfa',
      tabSelectedFg: '#fff',
      showMoreColor: theme.palette.primary.light,
      linkColor: theme.palette.primary.light,
      deleteColor: theme.palette.error.light,
    };
  }
  return {
    isDark,
    surface: theme.palette.grey[100],
    surfaceElevated: theme.palette.background.paper,
    border: theme.palette.divider,
    text: theme.palette.text.primary,
    muted: theme.palette.text.secondary,
    offRangeBg: alpha(theme.palette.common.black, 0.04),
    infoBoxBg: alpha(theme.palette.primary.main, 0.06),
    standardUnderline: theme.palette.divider,
    appointmentText: theme.palette.text.primary,
    selectHoverOutline: theme.palette.text.secondary,
    holidayCheck: theme.palette.action.active,
    createBtnBg: alpha(theme.palette.primary.main, 0.12),
    createBtnColor: theme.palette.primary.dark,
    createBtnHoverBg: alpha(theme.palette.primary.main, 0.2),
    saveBtnBg: theme.palette.primary.main,
    saveBtnColor: theme.palette.primary.contrastText,
    saveBtnHoverBg: theme.palette.primary.dark,
    tabSelectedFg: theme.palette.primary.contrastText,
    showMoreColor: theme.palette.primary.main,
    linkColor: theme.palette.primary.main,
    deleteColor: theme.palette.error.main,
  };
}
