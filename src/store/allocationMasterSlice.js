import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';
// Define the initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to post allocation master data
export const addAllocationMaster = createAsyncThunk(
  'allocationMaster/addAllocationMaster',
  async (allocationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/allocateMachineMaster`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allocationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save allocation data');
      }

      const data = await response.json();
      return data; // Assuming the API returns the saved data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save allocation data');
    }
  }
);


// Thunk to delete allocation data
export const deleteAllocationMaster = createAsyncThunk(
  'allocationMaster/deleteAllocationMaster',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/deleteallocateMachine/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
      
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete allocation data');
      }

      return id; // Return the allocationId to handle removal from state
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete allocation data');
    }
  }
);



const allocationMasterSlice = createSlice({
  name: 'allocationMaster',
  initialState,
  reducers: {
    resetState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAllocationMaster.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAllocationMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Allocation Master saved successfully!';
      })
      .addCase(addAllocationMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle the delete operation
      .addCase(deleteAllocationMaster.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAllocationMaster.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure state.data is an array before calling filter
        if (Array.isArray(state.data)) {
          state.data = state.data.filter((item) => item.id !== action.payload);
        } else {
          console.error("state.data is not an array: ", state.data);
        }
        state.successMessage = 'Allocation Master deleted successfully!';
      })
      .addCase(deleteAllocationMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the action to reset state
export const { resetState } = allocationMasterSlice.actions;

// Export the reducer to be used in the store
export default allocationMasterSlice.reducer;
