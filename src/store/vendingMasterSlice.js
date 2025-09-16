import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Initial State
const initialState = {
  data: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to add a vending master
export const addVendingMaster = createAsyncThunk(
  'vendingMaster/addVendingMaster',
  async (vendingMasterData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/addVendingMaster`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendingMasterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save vending machine');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save vending machine');
    }
  }
);

// Thunk to update vending master
export const updateVendingMaster = createAsyncThunk(
  'vendingMaster/updateVendingMaster',
  async ({ id, vendingMasterData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/updateVendingMaster/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendingMasterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update vending machine');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update vending machine');
    }
  }
);

// ✅ Thunk to delete vending master
export const deleteVendingMachine = createAsyncThunk(
  'vendingMaster/deleteVendingMachine',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/deleteVendingMachine/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete vending machine');
      }

      return id; // Return the deleted machine ID
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete vending machine');
    }
  }
);

// Slice
const vendingMasterSlice = createSlice({
  name: 'vendingMaster',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add Vending Master
      .addCase(addVendingMaster.pending, (state) => {
        state.loading = true;
      })
      .addCase(addVendingMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Vending Machine Master saved successfully!';
        state.error = null;
      })
      .addCase(addVendingMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Vending Master
      .addCase(updateVendingMaster.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVendingMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Vending Machine Master updated successfully!';
        state.error = null;
      })
      .addCase(updateVendingMaster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete Vending Machine
      .addCase(deleteVendingMachine.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVendingMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Vending Machine deleted successfully!';
        state.error = null;

        // Optionally remove the deleted item from the current data
        if (state.data && Array.isArray(state.data)) {
          state.data = state.data.filter((item) => item.machineId !== action.payload);
        }
      })
      .addCase(deleteVendingMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vendingMasterSlice.reducer;
