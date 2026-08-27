import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        filter: filterReducer,
    },
});
