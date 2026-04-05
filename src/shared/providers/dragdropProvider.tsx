"use client";

import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useAppDispatch } from "../hooks/redux";
import { providersType } from "../types/providersType";
import { projectApi } from "@/src/entities/project/api/projectApi";
export function AppDragDropProvider({ children }: providersType) {
  const dispatch = useAppDispatch();
  return (
    <DragDropProvider
      sensors={[
        PointerSensor.configure({
          activationConstraints: (event) => {
            if (event.pointerType === "touch") {
              return [
                new PointerActivationConstraints.Delay({
                  value: 0,
                  tolerance: 999,
                }),
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

        if (sourceId && deltaX <= -90) {
          dispatch(
            projectApi.endpoints.deleteProject.initiate(String(sourceId)),
          );
        }
      }}
    >
      {children}
    </DragDropProvider>
  );
}
