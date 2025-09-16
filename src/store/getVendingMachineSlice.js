import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  vendingMachines: [],
  loadingVendingMachines: false,
  errorVendingMachines: null,
};

// Thunk to fetch vending machines from API
export const fetchVendingMachines = createAsyncThunk(
  'vending/getVendingMachines',
  async (token) => {
    const response = await fetch(`${config.apiUrl}/api/getVendingMachines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch vending machines');
    }
    return data.data;
  }
);

// Create the slice
const getVendingMachineSlice = createSlice({
  name: 'getVendingMachine',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendingMachines.pending, (state) => {
        state.loadingVendingMachines = true;
      })
      .addCase(fetchVendingMachines.fulfilled, (state, action) => {
        state.loadingVendingMachines = false;
        state.vendingMachines = action.payload;
      })
      .addCase(fetchVendingMachines.rejected, (state, action) => {
        state.loadingVendingMachines = false;
        state.errorVendingMachines = action.error.message;
      });
  },
});

export default getVendingMachineSlice.reducer;
