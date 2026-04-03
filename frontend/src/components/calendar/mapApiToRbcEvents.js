import { alpha } from '@mui/material/styles';

/** Google Calendar–style tinted fills on light grids; solid blocks in dark mode. */
export function mapApiToRbcEvents(list, palette, options = {}) {
  const { theme, pastelFill } = options;
  const typeColors = {
    meeting: palette.primary,
    task: palette.secondary,
    reminder: palette.warning || palette.secondary,
    other: palette.grey,
  };
  return (list || []).map((ev) => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const c = typeColors[ev.eventType] || typeColors.other;
    const accent = ev.eventColor || c.main;
    const backgroundColor = pastelFill ? alpha(accent, 0.2) : accent;
    const color = pastelFill
      ? '#3c4043'
      : theme?.palette?.getContrastText
        ? theme.palette.getContrastText(backgroundColor)
        : '#fff';
    return {
      id: ev._recurrenceInstanceKey || ev._id,
      title: ev.title,
      start,
      end: end > start ? end : new Date(start.getTime() + 60 * 60 * 1000),
      allDay: !!ev.allDay,
      resource: ev,
      style: {
        backgroundColor,
        borderColor: pastelFill ? alpha(accent, 0.35) : ev.eventColor ? accent : c.dark,
        color,
        borderRadius: pastelFill ? 4 : 6,
        border: pastelFill ? `1px solid ${alpha(accent, 0.25)}` : 'none',
        borderLeft: pastelFill ? `3px solid ${accent}` : undefined,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.25,
      },
    };
  });
}
