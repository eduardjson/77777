import { BaseQueryFn, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:5000/api/";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: headers => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `${token}`);
    }
    console.log(headers);
    return headers;
  },
});

export const customFetchBaseQuery: BaseQueryFn<any, unknown, any> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if ((result as any).error?.status === 401) {
    alert("ПОПЫТКА ОБНОВЛЕНИЯ ТОКЕНА!!!");
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        if ((refreshResult as any).data) {
          const newAccessToken = (refreshResult as any).data.accessToken;
          if (newAccessToken) {
            localStorage.setItem("accessToken", newAccessToken);
            result = await baseQuery(args, api, extraOptions);
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  if ((result as any).error?.status === 401) {
    console.error("Авторизация не пройдена");
  }
  console.log(result);
  return result;
};
