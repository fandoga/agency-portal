"use client";

import * as React from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/src/store/store";

export interface ProvidersProps {
  children: React.ReactNode;
}

const store = makeStore();

export function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}
