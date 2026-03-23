"use client";

import { AuthProvider } from "../shared/providers/authProvider";
import { ReduxProvider } from "../shared/providers/reduxProvider";
import { providersType } from "../shared/types/providersType";

const AppShell = ({ children }: providersType) => {
  return (
    <AuthProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </AuthProvider>
  );
};

export default AppShell;
