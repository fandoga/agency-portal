"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../shared/providers/authProvider";
import { Providers } from "../shared/providers/Providers";

type AppShellProps = {
  children: ReactNode;
};

const AppShell = ({ children }: AppShellProps) => {
  return (
    <AuthProvider>
      <Providers>{children}</Providers>
    </AuthProvider>
  );
};

export default AppShell;
