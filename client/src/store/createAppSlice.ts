import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";

export const createAppSlice2 = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
