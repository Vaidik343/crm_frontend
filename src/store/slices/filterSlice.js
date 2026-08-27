import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
    name: 'filter',
    initialState: {
        searchText: '',
        items: ['Dashboard', 'Employee', 'Projects', 'Tasks', 'Settings'],
    },
    reducers: {
        setSearchText: (state, action) => {
            state.searchText = action.payload;
        },
    },
});

export const { setSearchText } = filterSlice.actions;
export default filterSlice.reducer;
