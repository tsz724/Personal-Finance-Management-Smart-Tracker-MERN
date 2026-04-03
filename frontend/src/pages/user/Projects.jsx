import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
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

export default function Projects() {
  useUserAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const loadWs = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.WORKSPACES);
      setWorkspaces(data);
      if (data.length && !workspaceId) setWorkspaceId(data[0]._id);
    } catch (e) {
      toast.error('Could not load workspaces');
    }
  };

  const loadProjects = async () => {
    if (!workspaceId) return;
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.PROJECTS, {
        params: { workspaceId },
      });
      setProjects(data);
    } catch (e) {
      toast.error('Could not load projects');
    }
  };

  useEffect(() => {
    loadWs();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [workspaceId]);

  const createProject = async () => {
    if (!workspaceId || !name.trim() || !key.trim()) {
      toast.error('Workspace, name, and key required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.PROJECTS, {
        workspaceId,
        name,
        key: key.trim().toUpperCase(),
        description,
      });
      toast.success('Project created');
      setOpen(false);
      setName('');
      setKey('');
      setDescription('');
      loadProjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Create failed');
    }
  };

  return (
    <Homelayout activeMenu="Work items">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Typography variant="h5" fontWeight={700} flex={1}>
          Projects &amp; boards
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
          New project
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track delivery like Jira or Azure DevOps: backlog, columns, and assignees per project.
      </Typography>

      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Lead</TableCell>
              <TableCell align="right">Board</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{p.key}</Typography>
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.lead?.name || '—'}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => navigate(`/projects/${p._id}/board`)}>
                    Open board
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New project</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
          <TextField
            label="Key (e.g. CRM)"
            fullWidth
            value={key}
            onChange={(e) => setKey(e.target.value)}
            margin="normal"
            helperText="Short code, unique in this workspace"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createProject}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {!workspaceId && (
        <Box sx={{ mt: 3 }}>
          <Typography color="text.secondary">Create a workspace first.</Typography>
        </Box>
      )}
    </Homelayout>
  );
}
