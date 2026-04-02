import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

// Используем fakeBaseQuery, так как будем писать логику внутри queryFn через Supabase SDK
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Profile", "Project", "Milestone", "Report"], // Для автоматического обновления данных
  endpoints: () => ({}),
});
