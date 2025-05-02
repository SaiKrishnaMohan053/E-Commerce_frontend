import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open:     false,
  message:  "",
  severity: "info",
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (state, action) => {
      const { message, severity = "info" } = action.payload;
      state.open     = true;
      state.message  = message;
      state.severity = severity;
    },
    hideAlert: (state) => {
      state.open = false;
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;