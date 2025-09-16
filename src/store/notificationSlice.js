import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  message: "",
  type: "", // "success" or "error"
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type; // success or error
    },
    closeNotification: (state) => {
      state.open = false;
    },
    clearNotification: (state) => {
      state.message = "";
      state.type = "";
      state.open = false;
    },
  },
});

export const { showNotification, closeNotification ,clearNotification} = notificationSlice.actions;
export default notificationSlice.reducer;
