import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CreateAgencyModal from "@/src/features/agencies/create-agency/CreateAgencyModal";
import { useAuth } from "@/src/shared/providers/authProvider";
import React from "react";

const ChooseAgencyEmpty = () => {
  const { session } = useAuth();

  console.log(session);
  return (
    <div className="max-w-90 mx-auto h-full flex flex-col pb-20 gap-4 items-center justify-center">
      <Card className="w-full" size="sm">
        <CardHeader className="text-center">
          <CardTitle className="font-semibold font-jost !text-2xl">
            Создайте свою первую команду
          </CardTitle>
          <CardDescription>Или вступите в существующую</CardDescription>
        </CardHeader>
        <Separator />
        <CardFooter className="flex flex-col gap-2">
          <CreateAgencyModal text="Создать команду" />
          <Button variant={"outline"} className="w-full rounded-full">
            Вступить
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChooseAgencyEmpty;
