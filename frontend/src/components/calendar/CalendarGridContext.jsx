import { createContext, useContext } from 'react';
import { Views } from 'react-big-calendar';

export const CalendarGridViewContext = createContext(Views.WEEK);

/** Current react-big-calendar view (week / day / month / agenda) for event label formatting. */
export function useCalendarGridView() {
  return useContext(CalendarGridViewContext);
}
