import React, { useContext } from 'react'
import Authlayout from '../../components/layout/authlayout'
import {Link,useNavigate } from 'react-router-dom'
import Input from '../../components/Input/Input'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'  
import { UserContext } from '../../context/UserContext'

const Login = () => {
const[email,setEmail]=React.useState("");
const[password,setPassword]=React.useState("");
const[error,setError]=React.useState("");

const { updateUser }=useContext(UserContext);

const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  
    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }

    if(!password){
      setError("Please enter your password.");
      return;
    }
    setError("");

    //Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
          email,
          password,
      });

      const { token, user } = response.data;

      if (token) {
          // Store token in localStorage
          localStorage.setItem('token', token);
          updateUser(user);
          navigate('/dashboard');
      }
  } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
          setError(error.response.data.message);
      } else {
          setError("Something went wrong. Please try again.");
      }
  }


}

  return (
    <Authlayout>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to your account
        </p>
      </div>
      {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

      <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({target}) => setEmail(target.value)}
            label="Email Address"
            placeholder="youremail@domain.com"
            type="text"
            autoComplete="email"
          />

          <Input
          value={password}
          onChange={({target}) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
          autoComplete="current-password"
          />

          <button
            type='submit'
            className="btn-primary"
          >
          LOGIN
          </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?
          <Link
            to="/register"
            className="text-orange-700 font-medium hover:underline"
          >
            Sign up
          </Link>
      </div>
    </Authlayout>
  )
}

export default Login