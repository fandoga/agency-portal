"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "../shared/providers/authProvider";
import { AppDragDropProvider } from "../shared/providers/dragdropProvider";
import { ReduxProvider } from "../shared/providers/reduxProvider";
import { providersType } from "../shared/types/providersType";

const Provider = ({ children }: providersType) => {
  return (
    <AuthProvider>
      <ReduxProvider>
        <TooltipProvider>
          <AppDragDropProvider>{children}</AppDragDropProvider>
        </TooltipProvider>
      </ReduxProvider>
    </AuthProvider>
  );
};

export default Provider;
