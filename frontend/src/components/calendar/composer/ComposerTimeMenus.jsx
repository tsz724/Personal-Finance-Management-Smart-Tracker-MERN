import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import moment from 'moment';
import { getBrowserTimeZone } from '../../../utils/timeZones';

export function ComposerTimeMenus({
  meetingTimeMenuPaperSx,
  startTimeMenuAnchor,
  endTimeMenuAnchor,
  setStartTimeMenuAnchor,
  setEndTimeMenuAnchor,
  startTimeDaySlots,
  endTimeSuggestionRows,
  setStart,
  setEnd,
  start,
  end,
  startMoment,
  startTimeZone,
  dialogOpen,
  allDay,
}) {
  return (
    <>
      <Menu
        anchorEl={startTimeMenuAnchor}
        open={Boolean(startTimeMenuAnchor) && dialogOpen && !allDay}
        onClose={() => setStartTimeMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { ...meetingTimeMenuPaperSx, width: 152 },
          },
        }}
        MenuListProps={{ dense: true, autoFocusItem: true }}
      >
        {startTimeDaySlots.map((m) => {
          const selected =
            m.clone().startOf('day').isSame(startMoment.clone().startOf('day')) &&
            m.format('HH:mm') === startMoment.format('HH:mm');
          return (
            <MenuItem
              key={m.valueOf()}
              selected={selected}
              onClick={() => {
                const stzig = startTimeZone || getBrowserTimeZone();
                const durMs = moment.utc(end).diff(moment.utc(start));
                const wallStart = moment.tz(
                  {
                    year: m.year(),
                    month: m.month(),
                    date: m.date(),
                    hour: m.hour(),
                    minute: m.minute(),
                    second: 0,
                    millisecond: 0,
                  },
                  stzig
                );
                const nextStartUtc = wallStart.utc().toISOString();
                const nextEndUtc = moment
                  .utc(nextStartUtc)
                  .add(Math.max(durMs, 15 * 60 * 1000), 'ms')
                  .toISOString();
                setStart(nextStartUtc);
                setEnd(nextEndUtc);
                setStartTimeMenuAnchor(null);
              }}
            >
              {m.format('h:mma')}
            </MenuItem>
          );
        })}
      </Menu>

      <Menu
        anchorEl={endTimeMenuAnchor}
        open={Boolean(endTimeMenuAnchor) && dialogOpen && !allDay}
        onClose={() => setEndTimeMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { ...meetingTimeMenuPaperSx, minWidth: 232 },
          },
        }}
        MenuListProps={{ dense: true, autoFocusItem: true }}
      >
        {endTimeSuggestionRows.map(({ endIso, timeLabel, durationLabel }) => {
          const selected = end === endIso;
          return (
            <MenuItem
              key={endIso}
              selected={selected}
              onClick={() => {
                const startUtcMs = moment.utc(start).valueOf();
                let next = endIso;
                if (moment.utc(next).valueOf() <= startUtcMs) {
                  next = moment.utc(startUtcMs + 15 * 60 * 1000).toISOString();
                }
                setEnd(next);
                setEndTimeMenuAnchor(null);
              }}
            >
              {`${timeLabel} (${durationLabel})`}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
