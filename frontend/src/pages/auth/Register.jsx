import React,{useContext} from 'react'
import Authlayout from '../../components/layout/Authlayout'
import {Link,useNavigate } from 'react-router-dom'
import Input from '../../components/Input/Input'
import GoogleAuthButton from '../../components/Auth/GoogleAuthButton'
import { validateEmail,isStrongPassword } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/UserContext'

const Register = () => {
  const[name,setname]=React.useState("");
  const[email,setEmail]=React.useState("");
  const[password,setPassword]=React.useState("");
  const[error,setError]=React.useState("");

  const { updateUser }=useContext(UserContext);

  const navigate = useNavigate();
  
  const handleRegister = async (e) => {
    e.preventDefault();

      if(!name){
        setError("Please enter your fullname");
        return;
      }
    
      if(!validateEmail(email)){
        setError("Please enter a valid email address.");
        return;
      }
  
      if(!isStrongPassword(password)){
        setError("Your parssword must contain atleast 8 characters.");
        return;
      }
      setError("");
  
      //Register API Call
  
      try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            name,
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

  const handleGoogleAuth = async (credential) => {
    setError("");
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE, {
        credential,
      });

      const { token, user } = response.data;

      if (token) {
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
          Create an Account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Join Expensa by entering your details below.
        </p>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <Input
            value={name}
            onChange={({target}) => setname(target.value)}
            label="Full Name"
            placeholder="John Doe"
            type="text"
            autoComplete="name"
            />

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
            autoComplete="new-password"
            />

            <button
              type='submit'
              className="btn-primary"
            >
            SIGN IN
            </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleAuthButton onAuthSuccess={handleGoogleAuth} onAuthError={setError} />
        
        <div className="mt-4 text-center text-sm text-gray-600">
             Already have an account?{"  "}
            <Link
              to="/Login"
              className="text-orange-700 font-medium hover:underline"
            >
              Log in
            </Link>
        </div>
      </div>

    </Authlayout>
  )
}

export default Register