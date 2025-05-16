import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Species {
  id: number;
  name: string;
  scientificName: string;
  conservationStatus: string;
  imageUrl?: string;
}

interface SpeciesState {
  species: Species[];
  loading: boolean;
  error: string | null;
}

const initialState: SpeciesState = {
  species: [],
  loading: false,
  error: null,
};

const speciesSlice = createSlice({
  name: 'species',
  initialState,
  reducers: {
    setSpecies: (state, action: PayloadAction<Species[]>) => {
      state.species = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setSpecies, setLoading, setError } = speciesSlice.actions;
export default speciesSlice.reducer;
