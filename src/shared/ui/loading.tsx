"use client";

import React from "react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const Loading = ({ text = "Загрузка..." }: { text?: string }) => {
  return (
    <div className="w-full z-1000 h-full my-[25vh]">
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>{text}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default Loading;
