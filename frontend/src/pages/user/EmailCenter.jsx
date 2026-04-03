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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

const FOLDERS = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'trash', label: 'Trash' },
];

export default function EmailCenter() {
  useUserAuth();
  const [folder, setFolder] = useState('inbox');
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.EMAILS, {
        params: { folder },
      });
      setList(data);
    } catch (e) {
      toast.error('Could not load messages');
    }
  };

  useEffect(() => {
    load();
  }, [folder]);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (folder === 'inbox' && !msg.read) {
      try {
        await axiosInstance.put(API_PATHS.BUSINESS.EMAIL(msg._id), { read: true });
        load();
      } catch (e) {
        /* ignore */
      }
    }
  };

  const send = async () => {
    if (!to.trim()) {
      toast.error('To is required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.EMAILS, {
        folder: 'sent',
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        subject,
        body,
        read: true,
      });
      toast.success('Message saved to Sent');
      setComposeOpen(false);
      setTo('');
      setSubject('');
      setBody('');
      if (folder === 'sent') load();
    } catch (e) {
      toast.error('Send failed');
    }
  };

  return (
    <Homelayout activeMenu="Email">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Email
        </Typography>
        <Button variant="contained" onClick={() => setComposeOpen(true)}>
          Compose
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Central place for messages linked to your work (similar to a lightweight mail client).
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={folder} onChange={(_, v) => setFolder(v)}>
          {FOLDERS.map((f) => (
            <Tab key={f.id} label={f.label} value={f.id} />
          ))}
        </Tabs>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper sx={{ flex: 1, maxHeight: 480, overflow: 'auto' }}>
          <List dense>
            {list.map((m) => (
              <ListItem key={m._id} disablePadding>
                <ListItemButton selected={selected?._id === m._id} onClick={() => openMessage(m)}>
                  <ListItemText
                    primary={m.subject || '(no subject)'}
                    secondary={`${m.from} · ${new Date(m.createdAt).toLocaleString()}`}
                    primaryTypographyProps={{
                      fontWeight: m.read || folder !== 'inbox' ? 400 : 700,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
        <Paper sx={{ flex: 1, p: 2, minHeight: 280 }}>
          {selected ? (
            <>
              <Typography variant="subtitle1" fontWeight={700}>
                {selected.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                From {selected.from} · To: {(selected.to || []).join(', ')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {selected.body || '—'}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">Select a message</Typography>
          )}
        </Paper>
      </Stack>

      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Compose</DialogTitle>
        <DialogContent>
          <TextField label="To (comma-separated emails)" fullWidth value={to} onChange={(e) => setTo(e.target.value)} margin="normal" />
          <TextField label="Subject" fullWidth value={subject} onChange={(e) => setSubject(e.target.value)} margin="normal" />
          <TextField
            label="Body"
            fullWidth
            multiline
            minRows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={send}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Homelayout>
  );
}
