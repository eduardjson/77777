import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CurrentProductState {
  id: string | null;
}

const initialState: CurrentProductState = {
  id: null,
};

export const currentProductSlice = createSlice({
  name: "currentProduct",
  initialState,
  reducers: {
    setCurrentProductId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    clearCurrentProductId(state) {
      state.id = null;
    },
  },
});

export const { setCurrentProductId, clearCurrentProductId } =
  currentProductSlice.actions;
export default currentProductSlice.reducer;
