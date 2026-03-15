import { createApi } from "@reduxjs/toolkit/query/react";
import { LoginFormData, RegisterFormData } from "../../components";
import { UserDTO } from "../../dto";
import { customFetchBaseQuery } from "../utils";

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: customFetchBaseQuery,
  tagTypes: ["Auth"],
  endpoints: builder => ({
    register: builder.mutation<UserDTO, RegisterFormData>({
      query(body) {
        return {
          url: "/auth/register",
          method: "POST",
          body,
        };
      },
    }),

    login: builder.mutation<{ accessToken: string }, LoginFormData>({
      query(credentials) {
        return {
          url: "/auth/login",
          method: "POST",
          body: credentials,
        };
      },
    }),
    logout: builder.mutation<void, string>({
      query(refreshToken) {
        return {
          url: "/auth/logout",
          method: "POST",
          body: { refreshToken },
        };
      },
    }),
    refreshTokens: builder.mutation({
      query(refreshToken) {
        return {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        };
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokensMutation,
  useLogoutMutation,
} = authApi;
