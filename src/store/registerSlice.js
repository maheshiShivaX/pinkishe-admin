import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  user: null, // Store user data after successful registration or update
  loading: false, // Loading state while the registration or update request is in progress
  error: null, // Error message if registration or update fails
  successMessage: null, // Success message after successful registration or update
};

// Thunk to register a user
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/userregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      return data.data; // Assuming the response contains the user data
    } catch (error) {
      return rejectWithValue(error.message); // Pass error message if the API call fails
    }
  }
);

// Thunk to update a user
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ username, userData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/userupdate/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }

      return data.data; // Assuming the response contains the updated user data
    } catch (error) {
      return rejectWithValue(error.message); // Pass error message if the API call fails
    }
  }
);

// Create the slice
const registerSlice = createSlice({
  name: 'userEdit',
  initialState,
  reducers: {
    // Optional: Reset state on logout or when needed
    resetState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null; 
      })
    
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Registration successful!'; 
      })
     
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
     
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null; 
        state.successMessage = null; 
      })
     
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'User updated successfully!'; 
      })
    
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message; 
      });
  },
});

export const { resetState } = registerSlice.actions;

export default registerSlice.reducer;
