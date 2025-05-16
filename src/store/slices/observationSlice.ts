import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Observation } from '../../types';

interface ObservationState {
  observations: Observation[];
  loading: boolean;
  error: string | null;
}

const initialState: ObservationState = {
  observations: [],
  loading: false,
  error: null,
};

const observationSlice = createSlice({
  name: 'observations',
  initialState,
  reducers: {
    addObservation: (state, action: PayloadAction<Observation>) => {
      state.observations.push(action.payload);
    },
    updateObservation: (state, action: PayloadAction<Observation>) => {
      const index = state.observations.findIndex(obs => obs.id === action.payload.id);
      if (index !== -1) {
        state.observations[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addObservation,
  updateObservation,
  setLoading,
  setError,
} = observationSlice.actions;

export default observationSlice.reducer;
