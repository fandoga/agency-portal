"use client";

import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { projectApi } from "@/src/entities/project/api/projectApi";
import { AuthProvider } from "../shared/providers/authProvider";
import { ReduxProvider, store } from "../shared/providers/reduxProvider";
import { providersType } from "../shared/types/providersType";

const Provider = ({ children }: providersType) => {
  return (
    <AuthProvider>
      <ReduxProvider>
        <DragDropProvider
          sensors={[
            PointerSensor.configure({
              activationConstraints: (event) => {
                if (event.pointerType === "touch") {
                  return [
                    new PointerActivationConstraints.Distance({ value: 4 }),
                  ];
                }

                return undefined;
              },
            }),
            KeyboardSensor,
          ]}
          onDragEnd={({ operation }) => {
            const sourceId = operation?.source?.id;
            const deltaX = operation?.transform?.x ?? 0;

            //Преместить куда то более локально!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if (sourceId && deltaX <= -79) {
              store.dispatch(
                projectApi.endpoints.deleteProject.initiate(String(sourceId)),
              );
            }
          }}
        >
          {children}
        </DragDropProvider>
      </ReduxProvider>
    </AuthProvider>
  );
};

export default Provider;
