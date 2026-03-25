import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

const EmptyProjects = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Проектов нет</EmptyTitle>
        <EmptyDescription>
          Вы пока не создали ни одного проекта, может пора?
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Создать первый</Button>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyProjects;
