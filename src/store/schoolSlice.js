import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Thunk to post school data
export const addSchoolData = createAsyncThunk(
  'school/addSchoolData',
  async (schoolData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/addSchool`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save school data');
      }

      const data = await response.json();
      return data; // Assuming the API returns the saved data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save school data');
    }
  }
);

// Thunk to fetch school details
export const fetchSchoolData = createAsyncThunk(
  'school/fetchSchoolData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/getSchool`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch school data');
      }

      const data = await response.json();
      return data.data; // Assuming the API returns the school data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch school data');
    }
  }
);

// Thunk to update school data
export const updateSchoolData = createAsyncThunk(
  'school/updateSchoolData',
  async ({id,schoolData}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/updateSchool/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update school data');
      }

      const data = await response.json();
      return data; // Assuming the API returns the updated data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update school data');
    }
  }
);


export const deleteSchoolData = createAsyncThunk(
  'school/deleteSchoolData',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.apiUrl}/api/deleteSchool/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseBody = await response.json(); // ✅ Parse it before using

      if (!response.ok) {
        return rejectWithValue(responseBody.message || "Failed to delete School");
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete school');
    }
  }
);


// Create the slice
const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle adding school data
      .addCase(addSchoolData.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'School data saved successfully!';
      })
      .addCase(addSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetching school data
      .addCase(fetchSchoolData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.successMessage = 'School data fetched successfully!';
      })
      .addCase(fetchSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updating school data
      .addCase(updateSchoolData.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;  // Update the state with the updated school data
        state.successMessage = 'School data updated successfully!';
      })
      .addCase(updateSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSchoolData.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSchoolData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(school => school.schoolId !== action.payload);
        state.successMessage = 'School deleted successfully!';
      })
      .addCase(deleteSchoolData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default schoolSlice.reducer;
