import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to post geolocation data
export const saveGeolocation = createAsyncThunk(
  'geolocation/saveGeolocation',
  async (geolocationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/addGeoLocation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geolocationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save geolocation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save geolocation');
    }
  }
);

// Thunk to get geolocation data
export const getGeoLocation = createAsyncThunk(
  'geolocation/getGeoLocation',
  async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/getGeoLocation`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.data; // Return the fetched geolocation data
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch data');
    }
  }
);

// Thunk to update geolocation data
export const updateGeolocation = createAsyncThunk(
  'geolocation/updateGeolocation',
  async ({ id, geoLocationData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/updateGeoLocation/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geoLocationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update geolocation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update geolocation');
    }
  }
);

// Thunk to delete geolocation data
export const deleteGeolocation = createAsyncThunk(
  "geolocation/deleteGeolocation",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${config.apiUrl}/api/deleteGeoLocation/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseBody = await response.json(); // ✅ Parse it before using

      if (!response.ok) {
        return rejectWithValue(responseBody.message || "Failed to delete geolocation");
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete geolocation");
    }
  }
);

// Create the slice
const geolocationSlice = createSlice({
  name: 'geolocation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveGeolocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveGeolocation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Geolocation saved successfully!';
      })
      .addCase(saveGeolocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getGeoLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getGeoLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getGeoLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateGeolocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGeolocation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'Geolocation updated successfully!';
      })
      .addCase(updateGeolocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteGeolocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGeolocation.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((geo) => geo.id !== action.payload); // Remove deleted item from state
        state.successMessage = 'Geolocation deleted successfully!';
      })
      .addCase(deleteGeolocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default geolocationSlice.reducer;
