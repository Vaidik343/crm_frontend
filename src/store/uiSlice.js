import { createSlice } from "@reduxjs/toolkit";

const initialState = { // <--- Fixed spelling here!
  isSidebarCollapsed: false,
  showLogoutModal: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    openLogoutModal: (state) => {
      state.showLogoutModal = true;
    },
    closeLogoutModal: (state) => {
      state.showLogoutModal = false;
    },
  },
});

export const {
  toggleSidebar,
  openLogoutModal,
  closeLogoutModal,
} = uiSlice.actions;

export default uiSlice.reducer;
