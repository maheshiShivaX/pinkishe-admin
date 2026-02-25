import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import config from "../config";

const initialState = {
  roles: [],
  loading: false,
  error: null,
};

// Fetch roles (isDeleted = false)
export const fetchRoles = createAsyncThunk(
  "role/fetchRoles",
  async (token) => {
    const response = await fetch(`${config.apiUrl}/api/role/list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch roles");
    }

    return data.data;
  }
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default roleSlice.reducer;
