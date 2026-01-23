import React from 'react'

import {
  BrowserRouter,
  Routes,
  Route, 
  Navigate
} from 'react-router-dom'

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/home';
import Expense from "./pages/user/expense";
import Income from './pages/user/income';
import UserProvider from './context/UserContext';

const App = () => {
  return (
    <UserProvider>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/income" element={<Income />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserProvider>
  );
};

export default App
const Root = () => {
  //check if token exists in local storage
  const token = !!localStorage.getItem("token");

  //redirect to dashboard if token exists else redirect to login
  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}
