import React, { useEffect, useState } from 'react';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

export default function CalendarPage() {
  useUserAuth();
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('meeting');

  const load = async () => {
    const from = new Date();
    const to = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.CALENDAR, {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
          scope: 'all',
        },
      });
      setEvents(data);
    } catch (e) {
      toast.error('Could not load calendar');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!title.trim() || !start || !end) {
      toast.error('Title, start, and end required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.CALENDAR, {
        title,
        start,
        end,
        location,
        eventType,
        visibility: 'personal',
      });
      toast.success('Event added');
      setOpen(false);
      setTitle('');
      setStart('');
      setEnd('');
      setLocation('');
      load();
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const grouped = events.reduce((acc, ev) => {
    const day = new Date(ev.start).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(ev);
    return acc;
  }, {});

  return (
    <Homelayout activeMenu="Calendar">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Calendar &amp; schedule
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New event
        </Button>
      </Stack>

      {Object.keys(grouped)
        .sort((a, b) => new Date(a) - new Date(b))
        .map((day) => (
          <Paper key={day} sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              {day}
            </Typography>
            <List dense>
              {grouped[day].map((ev) => (
                <ListItem key={ev._id}>
                  <ListItemText
                    primary={ev.title}
                    secondary={`${new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${ev.location ? ` · ${ev.location}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}

      {events.length === 0 && (
        <Typography color="text.secondary">No upcoming events in the next 120 days.</Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New event</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
          <TextField
            label="Start"
            type="datetime-local"
            fullWidth
            value={start}
            onChange={(e) => setStart(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End"
            type="datetime-local"
            fullWidth
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="task">Task</MenuItem>
              <MenuItem value="reminder">Reminder</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Homelayout>
  );
}
