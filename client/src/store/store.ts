import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  productApi,
  authApi,
  userApi,
  filterSlice,
  fileApi,
  warehouseApi,
  currentProductSlice,
  projectApi,
} from "../services";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(
  productApi,
  authApi,
  userApi,
  filterSlice,
  fileApi,
  warehouseApi,
  currentProductSlice,
  projectApi,
);

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat(
        productApi.middleware,
        authApi.middleware,
        userApi.middleware,
        fileApi.middleware,
        warehouseApi.middleware,
        projectApi.middleware,
      );
    },
    preloadedState,
  });
  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
