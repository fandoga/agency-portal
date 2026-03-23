"use client";

import * as React from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/src/store/store";
import { providersType } from "../types/providersType";

const store = makeStore();

export function ReduxProvider({ children }: providersType) {
  return <Provider store={store}>{children}</Provider>;
}
