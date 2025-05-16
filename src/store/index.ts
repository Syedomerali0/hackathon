import { configureStore } from '@reduxjs/toolkit';
import observationReducer from './slices/observationSlice';
import speciesReducer from './slices/speciesSlice';

export const store = configureStore({
  reducer: {
    observations: observationReducer,
    species: speciesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
