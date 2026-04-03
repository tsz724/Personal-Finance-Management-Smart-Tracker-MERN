import moment from 'moment';
import { Views } from 'react-big-calendar';
import { useCalendarGridView } from './CalendarGridContext';

/** Always includes am/pm, e.g. "11am", "2:30pm". */
function formatClockLower(m) {
  const x = moment(m);
  const min = x.minute();
  const ap = x.format('a').toLowerCase();
  if (min === 0) return `${x.format('h')}${ap}`;
  return `${x.format('h:mm')}${ap}`;
}

/** Start of a same-day range: "9:30" when meridian matches end, else "9:30am". */
function formatRangeLineStart(s, e) {
  const sameMeridian = (s.hour() < 12) === (e.hour() < 12);
  const min = s.minute();
  const ap = s.format('a').toLowerCase();
  if (!sameMeridian) {
    if (min === 0) return `${s.format('h')}${ap}`;
    return `${s.format('h:mm')}${ap}`;
  }
  if (min === 0) return `${s.format('h')}${ap}`;
  return s.format('h:mm');
}

/** Second line for long blocks, e.g. "9:30 - 11am", "9am - 2pm". */
export function formatEventTimeRangeLine(event, ev) {
  const start = event?.start ?? ev?.start;
  const end = event?.end ?? ev?.end;
  if (!start || !end) return '';
  const s = moment(start);
  const e = moment(end);
  if (!s.isSame(e, 'day')) {
    return `${s.format('MMM D')} ${formatClockLower(s)} - ${e.format('MMM D')} ${formatClockLower(e)}`;
  }
  if (s.isSame(e, 'minute')) return formatClockLower(s);
  return `${formatRangeLineStart(s, e)} - ${formatClockLower(e)}`;
}

/** Timed events this long use title on first line and range below (taller chips). */
const TWO_LINE_MIN_MS = 45 * 60 * 1000;

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

  const timePart = formatEventTimeRangeLine(event, ev);
  return `${displayTitle}, ${timePart}`;
}

/**
 * react-big-calendar `components.event`: “Title, 9a” for short blocks; title + time range on two lines when taller.
 * Agenda keeps title only (time is in its own column).
 */
export function CalendarEventChip(props) {
  const view = useCalendarGridView();
  const { event, title } = props;
  const ev = event?.resource ?? event;
  const allDay = ev?.allDay ?? event?.allDay;

  if (view === Views.AGENDA) {
    const t = String(title ?? ev?.title ?? '').trim() || '(No title)';
    return <span>{t}</span>;
  }

  const start = event?.start;
  const end = event?.end;
  const durationMs =
    start && end ? new Date(end).getTime() - new Date(start).getTime() : 0;
  const useTwoLines =
    !allDay && durationMs >= TWO_LINE_MIN_MS && !!start && !!end;

  if (useTwoLines) {
    const titleOnly = String(title ?? ev?.title ?? '').trim() || '(No title)';
    const range = formatEventTimeRangeLine(event, ev);
    return (
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          minWidth: 0,
          width: '100%',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {titleOnly}
        </span>
        <span
          style={{
            fontWeight: 500,
            opacity: 0.9,
            fontSize: '0.92em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {range}
        </span>
      </span>
    );
  }

  const text = formatEventCommaTime(event, ev, title, { includeTime: true });
  return <span>{text}</span>;
}
