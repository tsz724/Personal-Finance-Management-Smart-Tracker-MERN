import moment from 'moment';
import { Views } from 'react-big-calendar';

export function getFetchRange(date, view) {
  const d = moment(date);
  switch (view) {
    case Views.MONTH:
      return {
        from: d.clone().startOf('month').subtract(1, 'month').startOf('day'),
        to: d.clone().endOf('month').add(1, 'month').endOf('day'),
      };
    case Views.WEEK:
    case Views.WORK_WEEK:
      return {
        from: d.clone().startOf('week').subtract(1, 'week'),
        to: d.clone().endOf('week').add(1, 'week'),
      };
    case Views.DAY:
      return {
        from: d.clone().subtract(1, 'week'),
        to: d.clone().add(1, 'week'),
      };
    case Views.AGENDA:
    default:
      return {
        from: d.clone().startOf('day'),
        to: d.clone().add(6, 'months').endOf('day'),
      };
  }
}

export function toInputDate(d) {
  if (!d) return '';
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

export function parseInputDateOnly(dateStr, endOfDay) {
  if (!dateStr) return null;
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(
    y,
    m - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );
  return d;
}

/** Google Calendar–style duration suffix, e.g. "30 mins", "1 hr", "1.5 hrs". */
export function formatDurationLabel(startM, endM) {
  const minutes = endM.diff(startM, 'minute');
  if (minutes < 60) return `${minutes} mins`;
  const hours = minutes / 60;
  if (hours === 1) return '1 hr';
  if (hours === Math.floor(hours)) return `${hours} hrs`;
  return `${hours} hrs`;
}

/** 15-minute slots for one calendar day (12:00a–11:45p). */
export function slotsFifteenMinutesForDay(dayMoment) {
  const dayStart = dayMoment.clone().startOf('day');
  const out = [];
  for (let i = 0; i < 96; i += 1) {
    out.push(dayStart.clone().add(i * 15, 'minute'));
  }
  return out;
}

/** Build end-time menu from UTC `startIso` and label rows in `displayTz`. */
export function endTimeSuggestionsFromUtc(startIso, displayTz, count = 96) {
  const out = [];
  const sUtc = moment.utc(startIso);
  const startWall = sUtc.clone().tz(displayTz);
  for (let i = 1; i <= count; i += 1) {
    const eUtc = sUtc.clone().add(i * 15, 'minutes');
    const endWall = eUtc.clone().tz(displayTz);
    out.push({
      endIso: eUtc.toISOString(),
      timeLabel: endWall.format('h:mma'),
      durationLabel: formatDurationLabel(startWall, endWall),
    });
  }
  return out;
}

/** e.g. "first", "second", …, "last" — matches Google-style monthly labels. */
export function monthlyOrdinalLabel(m) {
  const weekday = m.day();
  const dom = m.date();
  let nth = 0;
  for (let d = 1; d <= dom; d += 1) {
    if (m.clone().date(d).day() === weekday) nth += 1;
  }
  const eom = m.daysInMonth();
  let hasLater = false;
  for (let d = dom + 1; d <= eom; d += 1) {
    if (m.clone().date(d).day() === weekday) {
      hasLater = true;
      break;
    }
  }
  const words = ['first', 'second', 'third', 'fourth'];
  if (!hasLater) return 'last';
  return words[nth - 1] || `${nth}th`;
}
