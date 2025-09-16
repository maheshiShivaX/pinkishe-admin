// src/redux/slices/organisationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';
// Define the initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to post organization data
export const saveOrganisation = createAsyncThunk(
  'organisation/saveOrganisation',
  async (organisationData, { rejectWithValue }) => {
    
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${config.apiUrl}/api/addOrganization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organisationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save organization');
      }

      const data = await response.json();
      return data; // Assuming the API returns the saved data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save organization');
    }
  }
);

// Create the slice
const organisationSlice = createSlice({
  name: 'organisation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveOrganisation.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveOrganisation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Organization saved successfully!';
      })
      .addCase(saveOrganisation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default organisationSlice.reducer;
