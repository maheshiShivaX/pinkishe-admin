import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  userDetails: [],
  updatingRole: false,
  deletingUser: false,  // New state to track deletion status
  loading: false,
  error: null,
};

// Thunk to fetch user details from the API
export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (token) => {
    const response = await fetch(`${config.apiUrl}/api/getUserDetailsAll`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user details');
    }
    return data.data;
  }
);

// Thunk to update the user's role
export const updateUserRole = createAsyncThunk(
  'user/updateUserRole',
  async ({ token, username, role }) => {
    const response = await fetch(`${config.apiUrl}/api/auth/assignrole`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, role }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user role');
    }
    return data.data;  // assuming response contains the updated user data
  }
);

// Thunk to delete a user
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (username, { getState }) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${config.apiUrl}/api/deleteUser/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete user');
    }
    return username; // Return the username of the deleted user
  }
);

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch user details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.updatingRole = true;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.updatingRole = false;
        state.userDetails = state.userDetails.map(user =>
          user.username === action.payload.username ? action.payload : user
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.updatingRole = false;
        state.error = action.error.message;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.deletingUser = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deletingUser = false;
        // Remove the deleted user from the userDetails list
        state.userDetails = state.userDetails.filter(user => user.username !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deletingUser = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
