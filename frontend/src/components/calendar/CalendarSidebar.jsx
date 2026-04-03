import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import moment from 'moment';

export function CalendarSidebar({
  cal,
  theme,
  isDark,
  displayName,
  currentDate,
  setCurrentDate,
  myCalOpen,
  setMyCalOpen,
  otherCalOpen,
  setOtherCalOpen,
  onCreate,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: 1, md: 320 },
        borderRight: { md: `1px solid ${cal.border}` },
        borderBottom: { xs: `1px solid ${cal.border}`, md: 'none' },
        bgcolor: cal.surface,
        color: cal.text,
        borderRadius: 0,
        p: 2,
      }}
    >
      <Button
        fullWidth
        startIcon={<AddIcon />}
        variant="contained"
        sx={{
          borderRadius: 999,
          py: 1.2,
          backgroundColor: cal.createBtnBg,
          color: cal.createBtnColor,
          boxShadow: 'none',
          '&:hover': { backgroundColor: cal.createBtnHoverBg, boxShadow: 'none' },
        }}
        onClick={onCreate}
      >
        Create
      </Button>

      <Box sx={{ mt: 2 }}>
        <DateCalendar
          value={moment(currentDate)}
          onChange={(v) => {
            if (!v) return;
            setCurrentDate(v.toDate());
          }}
          sx={{
            width: '100%',
            maxWidth: 340,
            mx: 'auto',
            color: cal.text,
            '& .MuiPickersCalendarHeader-label': { color: cal.text },
            '& .MuiDayCalendar-weekDayLabel': { color: cal.muted },
            '& .MuiPickersDay-root': { color: cal.text },
            '& .MuiPickersDay-root.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 2, borderColor: cal.border }} />

      <List dense disablePadding>
        <ListItem disablePadding sx={{ py: 0.5 }}>
          <ListItemText
            primary="Booking pages"
            secondary="(coming soon)"
            secondaryTypographyProps={{ sx: { color: cal.muted } }}
          />
          <IconButton size="small" sx={{ color: cal.muted }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </ListItem>

        <ListItem disablePadding sx={{ py: 0.25, cursor: 'pointer' }} onClick={() => setMyCalOpen((v) => !v)}>
          <ListItemIcon sx={{ minWidth: 32, color: cal.muted }}>
            {myCalOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemIcon>
          <ListItemText primary="My calendars" primaryTypographyProps={{ fontWeight: 700 }} />
        </ListItem>
        <Collapse in={myCalOpen} timeout="auto" unmountOnExit>
          <Stack spacing={1} sx={{ pl: 3, pr: 1, pb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  size="small"
                  sx={{ color: isDark ? theme.palette.primary.light : theme.palette.primary.main }}
                />
              }
              label={<Typography variant="body2">{displayName}</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  size="small"
                  sx={{ color: isDark ? theme.palette.secondary.light : theme.palette.secondary.main }}
                />
              }
              label={<Typography variant="body2">Tasks</Typography>}
            />
          </Stack>
        </Collapse>

        <ListItem disablePadding sx={{ py: 0.25, cursor: 'pointer' }} onClick={() => setOtherCalOpen((v) => !v)}>
          <ListItemIcon sx={{ minWidth: 32, color: cal.muted }}>
            {otherCalOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemIcon>
          <ListItemText primary="Other calendars" primaryTypographyProps={{ fontWeight: 700 }} />
        </ListItem>
        <Collapse in={otherCalOpen} timeout="auto" unmountOnExit>
          <Stack spacing={1} sx={{ pl: 3, pr: 1, pb: 1 }}>
            <FormControlLabel
              control={<Checkbox defaultChecked size="small" sx={{ color: cal.holidayCheck }} />}
              label={<Typography variant="body2">Holidays</Typography>}
            />
          </Stack>
        </Collapse>
      </List>
    </Paper>
  );
}
