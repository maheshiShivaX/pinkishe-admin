// store/loginAPI.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../config';

// Thunk to send OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (mobileNumber, { rejectWithValue }) => {
    try {
     
      const response = await axios.post(`${config.apiUrl}/api/auth/userlogin`, {
        MobileNo: mobileNumber,
      });

      if (response.data.message === 'OTP sent successfully. Please verify.') {
        return response.data.message;  // Success message
      }
      
      return rejectWithValue('Failed to send OTP');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to verify OTP and login
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ mobileNumber, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/verifyotp`, {
        MobileNo: mobileNumber,
        Otp: otp,
      });

      if (response.data.message === 'Login successful.') {
        // Store the token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('roleId', response.data.roleId);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('name', response.data.name);
        return response.data.token;  // JWT Token
      }

      return rejectWithValue('Invalid OTP');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
