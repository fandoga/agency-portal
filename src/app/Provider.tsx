"use client";

import { AuthProvider } from "../shared/providers/authProvider";
import { AppDragDropProvider } from "../shared/providers/dragdropProvider";
import { ReduxProvider } from "../shared/providers/reduxProvider";
import { providersType } from "../shared/types/providersType";

const Provider = ({ children }: providersType) => {
  return (
    <AuthProvider>
      <ReduxProvider>
        <AppDragDropProvider>{children}</AppDragDropProvider>
      </ReduxProvider>
    </AuthProvider>
  );
};

export default Provider;
