import React, { useEffect, useState } from 'react';
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

export default function Employees() {
  useUserAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');

  const loadWs = async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.WORKSPACES);
      setWorkspaces(data);
      if (data.length && !workspaceId) setWorkspaceId(data[0]._id);
    } catch (e) {
      toast.error('Could not load workspaces');
    }
  };

  const loadEmployees = async () => {
    if (!workspaceId) return;
    try {
      const { data } = await axiosInstance.get(API_PATHS.BUSINESS.EMPLOYEES, {
        params: { workspaceId },
      });
      setRows(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load employees');
    }
  };

  useEffect(() => {
    loadWs();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [workspaceId]);

  const save = async () => {
    if (!workspaceId || !email.trim()) {
      toast.error('Workspace and colleague email required');
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.BUSINESS.EMPLOYEES, {
        workspaceId,
        email: email.trim().toLowerCase(),
        department,
        position,
        phone,
      });
      toast.success('Employee record saved');
      setOpen(false);
      setEmail('');
      setDepartment('');
      setPosition('');
      setPhone('');
      loadEmployees();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <Homelayout activeMenu="Employees">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <Typography variant="h5" fontWeight={700} flex={1}>
          Employee management
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
          Add / update record
        </Button>
      </Stack>

      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.user?.name}</TableCell>
                <TableCell>{r.user?.email}</TableCell>
                <TableCell>{r.department}</TableCell>
                <TableCell>{r.position}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Employee record</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Workspace admins can link a user (by email) to HR fields for this workspace.
          </Typography>
          <TextField label="User email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
          <TextField label="Department" fullWidth value={department} onChange={(e) => setDepartment(e.target.value)} margin="normal" />
          <TextField label="Position" fullWidth value={position} onChange={(e) => setPosition(e.target.value)} margin="normal" />
          <TextField label="Phone" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {!workspaceId && (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">Create a workspace first.</Typography>
        </Box>
      )}
    </Homelayout>
  );
}
