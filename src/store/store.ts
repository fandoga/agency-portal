import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/src/shared/api/baseApi";
import "@/src/entities/project/api/projectApi";
import "@/src/entities/milestone/api/milestoneApi";
import { ProfileReducer } from "@/src/entities/profile/slice/profileSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      profile: ProfileReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
