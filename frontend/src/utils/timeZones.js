import moment from 'moment';
import 'moment-timezone';

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function listIanaTimeZones() {
  if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
    return Intl.supportedValuesOf('timeZone');
  }
  return moment.tz.names();
}

/** e.g. "(GMT-05:00) Colombia Standard Time" */
export function formatTimeZoneLabel(iana) {
  if (!iana) return '';
  try {
    const now = new Date();
    const off = moment.tz(now, iana).format('Z');
    const gmt = off === 'Z' || off === '+00:00' ? 'GMT+00:00' : `GMT${off}`;
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'long',
    }).formatToParts(now);
    const long = parts.find((p) => p.type === 'timeZoneName')?.value || iana;
    return `(${gmt}) ${long}`;
  } catch {
    return iana;
  }
}

/** Treat moment's Y/M/D h:m as wall clock in `tz`; return UTC ISO string. */
export function wallMomentToUtcIso(m, tz) {
  return moment
    .tz(
      {
        year: m.year(),
        month: m.month(),
        date: m.date(),
        hour: m.hour(),
        minute: m.minute(),
        second: 0,
        millisecond: 0,
      },
      tz
    )
    .utc()
    .toISOString();
}
