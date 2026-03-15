import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FilterState {
  searchQuery: string;
  manufacturer: string;
  minPrice: number | null;
  maxPrice: number | null;
}

const initialState: FilterState = {
  searchQuery: "",
  manufacturer: "",
  minPrice: null,
  maxPrice: null,
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setManufacturer: (state, action: PayloadAction<string>) => {
      state.manufacturer = action.payload;
    },
    setMinPrice: (state, action: PayloadAction<number | null>) => {
      state.minPrice = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<number | null>) => {
      state.maxPrice = action.payload;
    },
    resetFilters: state => {
      state.searchQuery = "";
      state.manufacturer = "";
      state.minPrice = null;
      state.maxPrice = null;
    },
  },
});

export const {
  setSearchQuery,
  setManufacturer,
  setMinPrice,
  setMaxPrice,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
