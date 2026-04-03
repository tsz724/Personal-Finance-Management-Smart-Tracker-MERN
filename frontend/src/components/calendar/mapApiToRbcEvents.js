export function mapApiToRbcEvents(list, palette) {
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
    const backgroundColor = ev.eventColor || c.main;
    return {
      id: ev._recurrenceInstanceKey || ev._id,
      title: ev.title,
      start,
      end: end > start ? end : new Date(start.getTime() + 60 * 60 * 1000),
      allDay: !!ev.allDay,
      resource: ev,
      style: {
        backgroundColor,
        borderColor: ev.eventColor ? backgroundColor : c.dark,
        color: '#fff',
        borderRadius: 6,
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
      },
    };
  });
}
