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
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Workspaces() {
  useUserAuth();
  const { user } = useContext(UserContext);
  const uid = user?._id || user?.id;
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberOpen, setMemberOpen] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const load = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.WORKSPACES);
      setList(data);
    } catch (e) {
      toast.error('Could not load workspaces');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim()) {
      toast.error('Name required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.WORKSPACES, { name, description });
      toast.success('Workspace created');
      setOpen(false);
      setName('');
      setDescription('');
      load();
    } catch (e) {
      toast.error('Create failed');
    }
  };

  const invite = async (wsId) => {
    if (!inviteEmail.trim()) {
      toast.error('Email required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.WORKSPACE_MEMBERS(wsId), { email: inviteEmail.trim() });
      toast.success('Member added');
      setMemberOpen(null);
      setInviteEmail('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invite failed');
    }
  };

  const removeWs = async (id, isOwner) => {
    if (!isOwner) {
      toast.error('Only the owner can delete');
      return;
    }
    if (!window.confirm('Delete this workspace?')) return;
    try {
      await axiosInstance.delete(API_PATHS.BUSINESS.WORKSPACE(id));
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <Homelayout activeMenu="Workspaces">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Workspaces
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New workspace
        </Button>
      </Stack>
      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((ws) => {
              const isOwner =
                String(ws.owner?._id || ws.owner) === String(uid);
              const me = ws.members?.find((m) => String(m.user?._id || m.user) === String(uid));
              const role = isOwner ? 'owner' : me?.role || 'member';
              return (
                <TableRow key={ws._id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ws.color || '#6366f1' }} />
                      <Typography fontWeight={600}>{ws.name}</Typography>
                    </Stack>
                    {ws.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {ws.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{ws.members?.length || 0}</TableCell>
                  <TableCell>{role}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setMemberOpen(ws._id)}>
                      Invite
                    </Button>
                    {isOwner && (
                      <IconButton size="small" color="error" onClick={() => removeWs(ws._id, isOwner)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create workspace</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!memberOpen} onClose={() => setMemberOpen(null)} fullWidth maxWidth="xs">
        <DialogTitle>Invite by email</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberOpen(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => invite(memberOpen)}>
            Add member
          </Button>
        </DialogActions>
      </Dialog>
    </Homelayout>
  );
}
