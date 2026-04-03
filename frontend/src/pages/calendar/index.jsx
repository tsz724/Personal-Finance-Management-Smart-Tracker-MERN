import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Homelayout from '../../components/layout/Homelayout';
import { CalendarPageLayout } from '../../components/calendar/CalendarPageLayout';
import { useCalendarPage } from '../../components/calendar/hooks/useCalendarPage';

export default function CalendarPage() {
  const page = useCalendarPage();

  return (
    <Homelayout activeMenu="Calendar" fullWidthContent>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <CalendarPageLayout page={page} />
      </LocalizationProvider>
    </Homelayout>
  );
}
