import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  ngoSpocNames: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to post NGO Spoc data
export const addNgoSpoc = createAsyncThunk(
  'ngoSpoc/addNgoSpoc',
  async (ngoSpocData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/addNgoSpoc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ngoSpocData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to add NGO Spoc');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add NGO Spoc');
    }
  }
);

// Thunk to fetch all NGO Spoc names
export const fetchNgoSpoc = createAsyncThunk(
  'ngoSpoc/fetchNgoSpoc',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/getNgoSpoc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch NGO Spocs');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch NGO Spocs');
    }
  }
);


// Thunk to update NGO Spoc
export const updateNgoSpoc = createAsyncThunk(
  'ngoSpoc/updateNgoSpoc',
  async ({ id, spocData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/updateNgoSpoc/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spocData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update NGO Spoc');
      }

      const data = await response.json();
      return data; // Assuming API returns the updated Spoc
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update NGO Spoc');
    }
  }
);


// Thunk to delete an NGO Spoc
export const deleteNgoSpoc = createAsyncThunk(
    'ngoSpoc/deleteNgoSpoc',
    async (id, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${config.apiUrl}/api/ngospoc/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          return rejectWithValue(errorData.message || 'Failed to delete NGO Spoc');
        }
  
        return id;  // Return the id of the deleted NGO Spoc
      } catch (error) {
        return rejectWithValue(error.message || 'Failed to delete NGO Spoc');
      }
    }
  );


const ngoSpocSlice = createSlice({
    name: 'ngoSpoc',
    initialState,
    reducers: {
      resetState: (state) => {
        state.ngoSpocNames = [];
        state.loading = false;
        state.error = null;
        state.successMessage = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(addNgoSpoc.pending, (state) => {
          state.loading = true;
        })
        .addCase(addNgoSpoc.fulfilled, (state, action) => {
          state.loading = false;
          state.ngoSpocNames.push(action.payload);
          state.successMessage = 'NGO Spoc added successfully!';
        })
        .addCase(addNgoSpoc.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(fetchNgoSpoc.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchNgoSpoc.fulfilled, (state, action) => {
          state.loading = false;
          state.ngoSpocNames = action.payload;
        })
        .addCase(fetchNgoSpoc.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })

        // Handle updating NGO Spoc
        .addCase(updateNgoSpoc.pending, (state) => {
          state.loading = true;
        })
        .addCase(updateNgoSpoc.fulfilled, (state, action) => {
        state.loading = false;
        state.ngoSpocNames = action.payload;
        state.successMessage = 'NGO Spoc updated successfully!';
        })
        .addCase(updateNgoSpoc.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })


        // Handle the delete NGO Spoc case
        .addCase(deleteNgoSpoc.pending, (state) => {
          state.loading = true;
        })
        .addCase(deleteNgoSpoc.fulfilled, (state, action) => {
          state.loading = false;
          // Remove the deleted NGO Spoc from the list
          state.ngoSpocNames = state.ngoSpocNames.filter(
            (ngo) => ngo.id !== action.payload
          );
          state.successMessage = 'NGO Spoc deleted successfully!';
        })
        .addCase(deleteNgoSpoc.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

export const { resetState } = ngoSpocSlice.actions;

export default ngoSpocSlice.reducer;
