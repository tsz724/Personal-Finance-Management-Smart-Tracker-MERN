import React, { useEffect, useState, useContext } from 'react';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

const STATUSES = ['open', 'in_progress', 'blocked', 'done', 'cancelled'];
const PRIOS = ['low', 'medium', 'high', 'urgent'];

export default function Jobs() {
  useUserAuth();
  const { user } = useContext(UserContext);
  const uid = user?._id || user?.id;

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');

  const loadWs = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.WORKSPACES);
      setWorkspaces(data);
      if (data.length && !workspaceId) setWorkspaceId(data[0]._id);
    } catch (e) {
      toast.error('Could not load workspaces');
    }
  };

  const loadJobs = async () => {
    if (!workspaceId) return;
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.JOBS, {
        params: { workspaceId },
      });
      setJobs(data);
    } catch (e) {
      toast.error('Could not load jobs');
    }
  };

  useEffect(() => {
    loadWs();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [workspaceId]);

  const createJob = async () => {
    if (!workspaceId || !title.trim()) {
      toast.error('Workspace and title required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.JOBS, {
        workspaceId,
        title,
        description,
        status,
        priority,
        assignee: uid,
      });
      toast.success('Job created');
      setOpen(false);
      setTitle('');
      setDescription('');
      loadJobs();
    } catch (e) {
      toast.error('Create failed');
    }
  };

  const patchStatus = async (job, next) => {
    try {
      await axiosInstance.put(API_PATHS.BUSINESS.JOB(job._id), { status: next });
      loadJobs();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <Homelayout activeMenu="Jobs">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Typography variant="h5" fontWeight={700} flex={1}>
          Job management
        </Typography>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Workspace</InputLabel>
          <Select
            label="Workspace"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            {workspaces.map((w) => (
              <MenuItem key={w._id} value={w._id}>
                {w.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={!workspaceId}>
          New job
        </Button>
      </Stack>

      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j._id}>
                <TableCell>
                  <Typography fontWeight={600}>{j.title}</Typography>
                  {j.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {j.description.slice(0, 120)}
                      {j.description.length > 120 ? '…' : ''}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{j.status}</TableCell>
                <TableCell>{j.priority}</TableCell>
                <TableCell>{j.assignee?.name || '—'}</TableCell>
                <TableCell align="right">
                  {j.status !== 'done' && (
                    <Button size="small" onClick={() => patchStatus(j, 'done')}>
                      Mark done
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New job</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIOS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Assignee defaults to you.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createJob}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {!workspaceId && (
        <Box sx={{ mt: 3 }}>
          <Typography color="text.secondary">Create a workspace first to manage jobs.</Typography>
        </Box>
      )}
    </Homelayout>
  );
}
