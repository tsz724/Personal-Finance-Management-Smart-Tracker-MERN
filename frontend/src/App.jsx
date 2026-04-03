import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/Home';
import Expense from './pages/user/Expense';
import Income from './pages/user/Income';
import Workspaces from './pages/user/Workspaces';
import Jobs from './pages/user/Jobs';
import Projects from './pages/user/Projects';
import WorkBoard from './pages/user/WorkBoard';
import EmailCenter from './pages/user/EmailCenter';
import Employees from './pages/user/Employees';
import CalendarPage from './pages/user/CalendarPage';
import Admin from './pages/user/Admin';
import UserProvider from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import Box from '@mui/material/Box';

const App = () => {
  return (
    <UserProvider>
      <Box sx={{ minHeight: '100%' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/workspaces" element={<Workspaces />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/board" element={<WorkBoard />} />
            <Route path="/finance/income" element={<Income />} />
            <Route path="/finance/expense" element={<Expense />} />
            <Route path="/income" element={<Navigate to="/finance/income" replace />} />
            <Route path="/expense" element={<Navigate to="/finance/expense" replace />} />
            <Route path="/email" element={<EmailCenter />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
      </Box>
      <Toaster
        toastOptions={{
          style: { fontSize: '13px' },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const token = !!localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};
