import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import config from '../config';

// Define the initial state
const initialState = {
    manualPads: [],
    loading: false,
    error: null,
    successMessage: null,
};

// Thunk to add Manual Pads
export const addManualPads = createAsyncThunk(
    'manualPads/addManualPads',
    async (manualPadsData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${config.apiUrl}/api/addManualPads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(manualPadsData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return rejectWithValue(errorData.message || 'Failed to save manual pad data');
            }

            const data = await response.json();
            return data; // Assuming the API returns the saved data
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save manual pad data');
        }
    }
);

// Thunk to update NGO Spoc
export const updateManualPads = createAsyncThunk(
    'manualPads/updateManualPads',
    async ({ id, manualPadsData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${config.apiUrl}/api/updateManualPads/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(manualPadsData),
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

export const getManualPads = createAsyncThunk(
    'manualPads/getManualPads',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${config.apiUrl}/api/getManualPads`, {
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

export const deleteManualPads = createAsyncThunk(
    'manualPads/deleteManualPads',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${config.apiUrl}/api/deleteManualPads/${id}`, {
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

const manualPadsSlice = createSlice({
    name: 'manualPads',
    initialState,
    reducers: {
        resetState: (state) => {
            state.manualPads = [];
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addManualPads.pending, (state) => {
                state.loading = true;
            })
            .addCase(addManualPads.fulfilled, (state, action) => {
                state.loading = false;
                state.manualPads.push(action.payload);
                state.successMessage = 'Manual Pads added successfully!';
            })
            .addCase(addManualPads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateManualPads.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateManualPads.fulfilled, (state, action) => {
                state.loading = false;
                state.manualPads = action.payload;
                state.successMessage = 'NGO Spoc updated successfully!';
            })
            .addCase(updateManualPads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ✅ Get manual pads
            .addCase(getManualPads.pending, (state) => {
                state.loading = true;
            })

            .addCase(getManualPads.fulfilled, (state, action) => {
                state.loading = false;
                state.manualPads = action.payload;   // ✅ puts API array here
            })

            .addCase(getManualPads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteManualPads.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteManualPads.fulfilled, (state, action) => {
                state.loading = false;
                state.manualPads = state.manualPads.filter(school => school.id !== action.payload);
                state.successMessage = 'manualPads deleted successfully!';
            })
            .addCase(deleteManualPads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetState } = manualPadsSlice.actions;

export default manualPadsSlice.reducer;
