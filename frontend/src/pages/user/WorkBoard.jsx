import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const TYPES = ['task', 'bug', 'story', 'epic'];
const PRIOS = ['low', 'medium', 'high', 'urgent'];

export default function WorkBoard() {
  useUserAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const uid = user?._id || user?.id;

  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [column, setColumn] = useState('backlog');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');

  const loadProject = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.PROJECT_BY_ID(projectId));
      setProject(data);
    } catch (e) {
      toast.error('Could not load project');
    }
  };

  const loadItems = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.WORK_ITEMS, {
        params: { projectId },
      });
      setItems(data);
    } catch (e) {
      toast.error('Could not load work items');
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadItems();
    }
  }, [projectId]);

  const createItem = async () => {
    if (!title.trim()) {
      toast.error('Title required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.WORK_ITEMS, {
        projectId,
        title,
        description,
        type,
        status: column,
        priority,
        assignee: uid,
      });
      toast.success('Item created');
      setOpen(false);
      setTitle('');
      setDescription('');
      loadItems();
    } catch (e) {
      toast.error('Create failed');
    }
  };

  const move = async (item, status) => {
    try {
      await axiosInstance.put(API_PATHS.BUSINESS.WORK_ITEM(item._id), { status });
      loadItems();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <Homelayout activeMenu="Work items">
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button onClick={() => navigate('/projects')}>← Projects</Button>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {project ? `${project.key} · ${project.name}` : 'Board'}
          </Typography>
          {project?.description && (
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          )}
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New item
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {COLUMNS.map((col) => (
          <Box key={col.id} sx={{ flex: '1 1 220px', minWidth: 200, maxWidth: 360 }}>
            <Paper sx={{ p: 1.5, minHeight: 320 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                {col.label}
              </Typography>
              <Stack spacing={1}>
                {items
                  .filter((it) => it.status === col.id)
                  .map((it) => (
                    <Paper key={it._id} variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {it.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={it.type} />
                        <Chip size="small" label={it.priority} variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {it.assignee?.name || 'Unassigned'}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                        {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                          <Button
                            key={c.id}
                            size="small"
                            onClick={() => move(it, c.id)}
                          >
                            → {c.label}
                          </Button>
                        ))}
                      </Stack>
                    </Paper>
                  ))}
              </Stack>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New work item</DialogTitle>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Column</InputLabel>
            <Select label="Column" value={column} onChange={(e) => setColumn(e.target.value)}>
              {COLUMNS.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((s) => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createItem}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Homelayout>
  );
}
