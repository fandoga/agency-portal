"use client";

import * as React from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/src/store/store";
import { providersType } from "../types/providersType";

export function ReduxProvider({ children }: providersType) {
  const [store] = React.useState(() => makeStore());
  return <Provider store={store}>{children}</Provider>;
}
