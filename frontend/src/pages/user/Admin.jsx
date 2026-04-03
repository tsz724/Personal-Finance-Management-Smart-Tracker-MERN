import React, { useEffect, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Homelayout from '../../components/layout/Homelayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
export default function Admin() {
  useUserAuth();
  const { user } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);

  const load = async () => {
    try {
      const [u, s] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.USERS),
        axiosInstance.get(API_PATHS.ADMIN.STATS),
      ]);
      setRows(u.data);
      setStats(s.data);
    } catch (e) {
      toast.error('Admin data unavailable');
    }
  };

  useEffect(() => {
    if ((user?.role || 'employee') === 'admin') load();
  }, [user]);

  const setRole = async (id, role) => {
    try {
      await axiosInstance.patch(API_PATHS.ADMIN.USER_ROLE(id), { role });
      toast.success('Role updated');
      load();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const setActive = async (row, isActive) => {
    try {
      await axiosInstance.patch(API_PATHS.ADMIN.USER_ACTIVE(row._id), { isActive });
      toast.success('User updated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  if (user && (user.role || 'employee') !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Homelayout activeMenu="Admin">
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Administration
      </Typography>
      {stats && (
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Active users
            </Typography>
            <Typography variant="h6">{stats.activeUsers}</Typography>
          </Paper>
          <Paper sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Workspaces
            </Typography>
            <Typography variant="h6">{stats.workspaces}</Typography>
          </Paper>
          <Paper sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Open jobs
            </Typography>
            <Typography variant="h6">{stats.openJobs}</Typography>
          </Paper>
          <Paper sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Open work items
            </Typography>
            <Typography variant="h6">{stats.openWorkItems}</Typography>
          </Paper>
        </Stack>
      )}
      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      label="Role"
                      value={r.role || 'employee'}
                      onChange={(e) => setRole(r._id, e.target.value)}
                    >
                      <MenuItem value="employee">employee</MenuItem>
                      <MenuItem value="manager">manager</MenuItem>
                      <MenuItem value="admin">admin</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={r.isActive !== false}
                    onChange={(e) => setActive(r, e.target.checked)}
                      color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Homelayout>
  );
}
