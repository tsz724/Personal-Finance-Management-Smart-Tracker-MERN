import React from 'react'

import {
  BrowserRouter,
  Routes,
  Route, 
  Navigate
} from 'react-router-dom'

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/Home';
import Expense from "./pages/user/Expense";
import Income from './pages/user/Income';
import UserProvider from './context/UserContext';
import {Toaster} from "react-hot-toast";

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
      <Toaster
        toastOptions={{
          className:"",
          style:{
            fontSize:'13px'
          },
        }}
        />
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
