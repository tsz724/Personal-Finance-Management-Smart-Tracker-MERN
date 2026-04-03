import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { CalendarGridPanel } from './CalendarGridPanel';
import { CalendarSidebar } from './CalendarSidebar';
import { EventComposerDialog } from './composer/EventComposerDialog';
import { ComposerTimeMenus } from './composer/ComposerTimeMenus';
import { DeleteRecurringDialog } from './dialogs/DeleteRecurringDialog';
import { TimeZoneDialog } from './dialogs/TimeZoneDialog';

/** Main calendar feature layout: sidebar, react-big-calendar grid, composer, and auxiliary dialogs. */
export function CalendarPageLayout({ page }) {
  const { cal, theme, isDark, displayName, sidebar, grid, composer, deleteRecurring, timeZoneDialog, timeMenus } = page;

  return (
    <>
      <Box
        sx={{
          bgcolor: cal.surface,
          color: cal.text,
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: 'calc(100vh - 72px)' }}>
          <CalendarSidebar
            cal={cal}
            theme={theme}
            isDark={isDark}
            displayName={displayName}
            currentDate={sidebar.currentDate}
            setCurrentDate={sidebar.setCurrentDate}
            myCalOpen={sidebar.myCalOpen}
            setMyCalOpen={sidebar.setMyCalOpen}
            otherCalOpen={sidebar.otherCalOpen}
            setOtherCalOpen={sidebar.setOtherCalOpen}
            onCreate={sidebar.onCreate}
          />
          <CalendarGridPanel
            cal={cal}
            theme={theme}
            currentView={grid.currentView}
            setCurrentView={grid.setCurrentView}
            currentDate={grid.currentDate}
            setCurrentDate={grid.setCurrentDate}
            headerLabel={grid.headerLabel}
            navigateCal={grid.navigateCal}
            calendarEvents={grid.calendarEvents}
            onSelectSlot={grid.onSelectSlot}
            onSelectEvent={grid.onSelectEvent}
            eventStyleGetter={grid.eventStyleGetter}
            onEventDrop={grid.onEventDrop}
            onEventResize={grid.onEventResize}
          />
        </Stack>
      </Box>

      <EventComposerDialog cal={cal} composer={composer} />

      <DeleteRecurringDialog
        cal={cal}
        theme={theme}
        isDark={isDark}
        open={deleteRecurring.open}
        onClose={() => deleteRecurring.setOpen(false)}
        scope={deleteRecurring.scope}
        onScopeChange={deleteRecurring.setScope}
        onConfirm={deleteRecurring.onConfirm}
      />

      <TimeZoneDialog
        cal={cal}
        theme={theme}
        isDark={isDark}
        open={timeZoneDialog.open}
        onClose={timeZoneDialog.onClose}
        tzDraftSeparate={timeZoneDialog.tzDraftSeparate}
        setTzDraftSeparate={timeZoneDialog.setTzDraftSeparate}
        tzDraftStart={timeZoneDialog.tzDraftStart}
        setTzDraftStart={timeZoneDialog.setTzDraftStart}
        tzDraftEnd={timeZoneDialog.tzDraftEnd}
        setTzDraftEnd={timeZoneDialog.setTzDraftEnd}
        timeZoneAutocompleteOptions={timeZoneDialog.timeZoneAutocompleteOptions}
        onConfirm={timeZoneDialog.onConfirm}
        applyCurrent={timeZoneDialog.applyCurrent}
      />

      <ComposerTimeMenus {...timeMenus} />
    </>
  );
}
