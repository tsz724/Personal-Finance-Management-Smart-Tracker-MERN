import moment from 'moment';
import { Views } from 'react-big-calendar';
import { useCalendarGridView } from './CalendarGridContext';

/** Compact time like "9a" / "9:30a" (single-letter am/pm, no redundant :00). */
function compactClock(m) {
  const x = moment(m);
  const h = x.format('h');
  const min = x.minute();
  const ap = x.hour() < 12 ? 'a' : 'p';
  if (min === 0) return `${h}${ap}`;
  return `${h}:${String(min).padStart(2, '0')}${ap}`;
}

export function formatEventCommaTime(event, ev, titleFromAccessor, { includeTime = true } = {}) {
  const start = event?.start ?? ev?.start;
  const end = event?.end ?? ev?.end;
  const displayTitle =
    String(titleFromAccessor ?? ev?.title ?? event?.title ?? '').trim() || '(No title)';

  if (!includeTime || !start) return displayTitle;

  const allDay = ev?.allDay ?? event?.allDay;
  if (allDay) {
    const s = moment(start);
    const e = moment(end);
    if (s.isSame(e, 'day')) return `${displayTitle}, All day`;
    return `${displayTitle}, ${s.format('MMM D')} – ${e.format('MMM D')}`;
  }

  const s = moment(start);
  const e = moment(end);
  let timePart;
  if (s.isSame(e, 'minute')) {
    timePart = compactClock(s);
  } else if (s.isSame(e, 'day')) {
    timePart = `${compactClock(s)} – ${compactClock(e)}`;
  } else {
    timePart = `${s.format('MMM D')} ${compactClock(s)} – ${e.format('MMM D')} ${compactClock(e)}`;
  }
  return `${displayTitle}, ${timePart}`;
}

/**
 * react-big-calendar `components.event`: one line “Title, 9am” (list style), not separate time row.
 * Agenda view already has a time column — title only there.
 */
export function CalendarEventChip(props) {
  const view = useCalendarGridView();
  const { event, title } = props;
  const ev = event?.resource ?? event;

  const text =
    view === Views.AGENDA
      ? String(title ?? ev?.title ?? '').trim() || '(No title)'
      : formatEventCommaTime(event, ev, title, { includeTime: true });

  return <span>{text}</span>;
}
