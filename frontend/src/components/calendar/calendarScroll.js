import moment from 'moment';
import { Views } from 'react-big-calendar';

function earliestTimedEventStart(events, windowStartMs, windowEndMs) {
  let best = null;
  for (const evt of events || []) {
    const res = evt.resource;
    const allDay = res?.allDay ?? evt.allDay;
    if (allDay) continue;
    const t = new Date(evt.start).getTime();
    if (t >= windowStartMs && t <= windowEndMs && (best == null || t < best)) best = t;
  }
  return best == null ? null : new Date(best);
}

function atDayHour(dayMoment, hour) {
  return dayMoment.clone().startOf('day').hour(hour).minute(0).second(0).millisecond(0).toDate();
}

/**
 * Target clock time for react-big-calendar scrollToTime (week/day), Google-style:
 * — if the visible range includes today → now;
 * — else earliest timed event in range;
 * — else ~7:00 on the first day of that range.
 */
export function getCalendarScrollToTime(view, anchorDate, events) {
  const now = new Date();

  if (view !== Views.WEEK && view !== Views.DAY) {
    return now;
  }

  const mNow = moment(now);
  const mAnchor = moment(anchorDate);

  if (view === Views.DAY) {
    if (mNow.isSame(mAnchor, 'day')) return now;
    const dayStart = mAnchor.clone().startOf('day').valueOf();
    const dayEnd = mAnchor.clone().endOf('day').valueOf();
    return earliestTimedEventStart(events, dayStart, dayEnd) ?? atDayHour(mAnchor, 7);
  }

  const wStart = mAnchor.clone().startOf('week');
  const wEnd = mAnchor.clone().endOf('week');
  if (mNow.isBetween(wStart, wEnd, 'day', '[]')) return now;

  const rangeStart = wStart.clone().startOf('day').valueOf();
  const rangeEnd = wEnd.clone().endOf('day').valueOf();
  return earliestTimedEventStart(events, rangeStart, rangeEnd) ?? atDayHour(wStart, 7);
}

/**
 * RBC TimeGrid only runs calculateScroll on mount; after events load async the grid stays at midnight.
 * Apply the same scroll ratio as TimeGrid (full-day min/max) with a slight offset above the anchor.
 */
export function applyTimeGridScroll(calendarRootEl, view, anchorDate, events) {
  if (!calendarRootEl || (view !== Views.WEEK && view !== Views.DAY)) return;
  const content = calendarRootEl.querySelector('.rbc-time-content');
  if (!content || content.scrollHeight <= 0) return;

  const scrollToTime = getCalendarScrollToTime(view, anchorDate, events);
  const startOfDay = moment(scrollToTime).startOf('day').valueOf();
  const msIntoDay = moment(scrollToTime).valueOf() - startOfDay;
  const dayMs = 24 * 60 * 60 * 1000;
  const ratio = Math.min(1, Math.max(0, msIntoDay / dayMs));

  const desiredTop = content.scrollHeight * ratio - content.clientHeight * 0.22;
  content.scrollTop = Math.max(
    0,
    Math.min(desiredTop, content.scrollHeight - content.clientHeight)
  );
}
