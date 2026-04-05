import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import CreateProjectModal from "@/src/features/projects/create-project/CreateProjectModal";

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
        <CreateProjectModal text="Создать первый" />
      </EmptyContent>
    </Empty>
  );
};

export default EmptyProjects;
