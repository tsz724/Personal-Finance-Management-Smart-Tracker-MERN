/**
 * Expand a stored calendar event (with recurrence.pattern) into occurrences
 * overlapping [rangeStart, rangeEnd] (inclusive window by event start time).
 */

const MAX_INSTANCES = 600;

function addDays(d, n) {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
}

function addYears(d, n) {
    const x = new Date(d.getTime());
    x.setFullYear(x.getFullYear() + n);
    return x;
}

/** @returns {{ weekday: number, ordinal: number }} ordinal 1–4 or -1 (last) */
function monthlyOrdinalFromAnchor(anchor) {
    const wd = anchor.getDay();
    const dom = anchor.getDate();
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    let nth = 0;
    for (let day = 1; day <= dom; day += 1) {
        const dt = new Date(y, m, day);
        if (dt.getDay() === wd) nth += 1;
    }
    const lastD = new Date(y, m + 1, 0).getDate();
    let hasLater = false;
    for (let day = dom + 1; day <= lastD; day += 1) {
        const dt = new Date(y, m, day);
        if (dt.getDay() === wd) {
            hasLater = true;
            break;
        }
    }
    return { weekday: wd, ordinal: hasLater ? nth : -1 };
}

function nthWeekdayInMonth(year, month, weekday, ordinal) {
    if (ordinal === -1) {
        const lastDom = new Date(year, month + 1, 0).getDate();
        for (let day = lastDom; day >= 1; day -= 1) {
            const dt = new Date(year, month, day);
            if (dt.getDay() === weekday) return dt;
        }
        return null;
    }
    let count = 0;
    const lastDom = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= lastDom; day += 1) {
        const dt = new Date(year, month, day);
        if (dt.getMonth() !== month) break;
        if (dt.getDay() === weekday) {
            count += 1;
            if (count === ordinal) return dt;
        }
    }
    return null;
}

function combineDateTime(datePortion, timeSource) {
    return new Date(
        datePortion.getFullYear(),
        datePortion.getMonth(),
        datePortion.getDate(),
        timeSource.getHours(),
        timeSource.getMinutes(),
        timeSource.getSeconds(),
        timeSource.getMilliseconds()
    );
}

function yearlyDateForYear(anchor, year) {
    const month = anchor.getMonth();
    const day = anchor.getDate();
    const last = new Date(year, month + 1, 0).getDate();
    const dom = Math.min(day, last);
    return new Date(year, month, dom, anchor.getHours(), anchor.getMinutes(), anchor.getSeconds(), anchor.getMilliseconds());
}

/**
 * @param {object} ev - plain event object (lean doc)
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 * @returns {Array<{ start: Date, end: Date }>}
 */
function expandRecurrence(ev, rangeStart, rangeEnd) {
    const pattern = ev.recurrence && ev.recurrence.pattern;
    if (!pattern || pattern === 'none' || pattern === 'custom') {
        return [];
    }

    const anchorStart = new Date(ev.start);
    const anchorEnd = new Date(ev.end);
    const dur = anchorEnd.getTime() - anchorStart.getTime();
    if (dur <= 0) return [];

    const until = ev.recurrence.until ? new Date(ev.recurrence.until) : null;
    const windowEnd = until && until < rangeEnd ? until : rangeEnd;
    const exceptionStarts = new Set(
        (ev.recurrence.exceptions || []).map((d) => new Date(d).getTime())
    );

    const out = [];
    /** @returns {boolean} continue iterating */
    const pushIf = (s) => {
        if (out.length >= MAX_INSTANCES) return false;
        if (s < anchorStart) return true;
        if (until && s > until) return false;
        const e = new Date(s.getTime() + dur);
        if (s > rangeEnd) return false;
        const overlaps = e >= rangeStart && s <= rangeEnd;
        if (overlaps) {
            if (exceptionStarts.has(s.getTime())) return true;
            out.push({ start: new Date(s.getTime()), end: e });
        }
        return true;
    };

    if (pattern === 'daily') {
        let cur = new Date(anchorStart.getTime());
        let guard = 0;
        while (guard < 4000) {
            if (!pushIf(cur)) break;
            cur = addDays(cur, 1);
            guard += 1;
        }
    } else if (pattern === 'weekly') {
        let cur = new Date(anchorStart.getTime());
        let guard = 0;
        while (guard < 2000) {
            if (!pushIf(cur)) break;
            cur = addDays(cur, 7);
            guard += 1;
        }
    } else if (pattern === 'weekdays') {
        let cur = new Date(anchorStart.getTime());
        let guard = 0;
        while (guard < 4000) {
            const dow = cur.getDay();
            if (dow >= 1 && dow <= 5 && cur >= anchorStart) {
                if (!pushIf(cur)) break;
            }
            cur = addDays(cur, 1);
            guard += 1;
        }
    } else if (pattern === 'monthly') {
        const { weekday, ordinal } = monthlyOrdinalFromAnchor(anchorStart);
        const cur = new Date(anchorStart.getFullYear(), anchorStart.getMonth(), 1);
        let guard = 0;
        while (guard < 2400) {
            const datePart = nthWeekdayInMonth(cur.getFullYear(), cur.getMonth(), weekday, ordinal);
            if (datePart) {
                const inst = combineDateTime(datePart, anchorStart);
                if (inst >= anchorStart && !pushIf(inst)) break;
            }
            cur.setMonth(cur.getMonth() + 1);
            guard += 1;
            if (cur.getTime() > addDays(windowEnd, 62).getTime()) break;
        }
    } else if (pattern === 'yearly') {
        let y = anchorStart.getFullYear();
        const endY = windowEnd.getFullYear() + 1;
        while (y <= endY && out.length < MAX_INSTANCES) {
            const inst = yearlyDateForYear(anchorStart, y);
            if (inst >= anchorStart) if (!pushIf(inst)) break;
            y += 1;
        }
    }

    return out;
}

module.exports = { expandRecurrence, MAX_INSTANCES };
