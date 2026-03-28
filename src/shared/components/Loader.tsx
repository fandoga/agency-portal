"use client";

import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const Loader = () => {
  return (
    <div className="w-full h-full my-[25vh]">
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Загружаем ваши проекты</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default Loader;
