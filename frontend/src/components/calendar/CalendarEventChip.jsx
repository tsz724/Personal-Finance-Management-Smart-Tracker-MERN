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

const titleWrapSx = {
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  lineHeight: 1.25,
};

const subtitleWrapSx = {
  ...titleWrapSx,
  fontSize: '0.92em',
  opacity: 0.9,
  fontWeight: 500,
  lineHeight: 1.2,
};

/** Title + optional subtitle (time / all-day) for responsive wrapping. */
export function getEventChipTitleParts(event, ev, titleFromAccessor) {
  const title =
    String(titleFromAccessor ?? ev?.title ?? event?.title ?? '').trim() || '(No title)';
  const start = event?.start ?? ev?.start;
  const end = event?.end ?? ev?.end;
  if (!start) return { title, subtitle: null };

  const allDay = ev?.allDay ?? event?.allDay;
  if (allDay) {
    const s = moment(start);
    const e = moment(end);
    const subtitle = s.isSame(e, 'day')
      ? 'All day'
      : `${s.format('MMM D')} – ${e.format('MMM D')}`;
    return { title, subtitle };
  }
  return { title, subtitle: formatEventTimeRangeLine(event, ev) };
}

function EventChipBody({ title, subtitle }) {
  if (!subtitle) {
    return <span style={{ display: 'block', minWidth: 0, ...titleWrapSx }}>{title}</span>;
  }
  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        width: '100%',
        alignItems: 'stretch',
      }}
    >
      <span style={titleWrapSx}>{title}</span>
      <span style={subtitleWrapSx}>{subtitle}</span>
    </span>
  );
}

/**
 * react-big-calendar `components.event`: responsive wrapping title + time; long timed blocks keep range on second line.
 * Agenda keeps title only (time is in its own column).
 */
export function CalendarEventChip(props) {
  const view = useCalendarGridView();
  const { event, title } = props;
  const ev = event?.resource ?? event;
  const allDay = ev?.allDay ?? event?.allDay;

  if (view === Views.AGENDA) {
    const t = String(title ?? ev?.title ?? '').trim() || '(No title)';
    return (
      <span style={{ display: 'block', minWidth: 0, ...titleWrapSx }}>
        {t}
      </span>
    );
  }

  const start = event?.start;
  const end = event?.end;
  const durationMs =
    start && end ? new Date(end).getTime() - new Date(start).getTime() : 0;
  const useTwoLines =
    !allDay && durationMs >= TWO_LINE_MIN_MS && !!start && !!end;

  if (useTwoLines) {
    const { title: titleOnly, subtitle: range } = getEventChipTitleParts(event, ev, title);
    return (
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 2,
          minWidth: 0,
          width: '100%',
        }}
      >
        <span style={titleWrapSx}>{titleOnly}</span>
        <span style={subtitleWrapSx}>{range}</span>
      </span>
    );
  }

  const parts = getEventChipTitleParts(event, ev, title);
  return <EventChipBody {...parts} />;
}
