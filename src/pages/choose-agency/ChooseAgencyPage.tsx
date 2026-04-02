"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AgencyList from "@/src/entities/profile/ui/AgencyList";

const ChooseAgencyPage = () => {
  return (
    <div className="container h-[100vh] flex flex-col pb-20 items-center justify-center">
      <Card size="sm">
        <CardHeader className="text-center">
          <CardTitle className="font-semibold font-jost !text-2xl">
            Где работаем сегодня?
          </CardTitle>
          <CardDescription>
            Выберите команду из списка или создайте новую
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgencyList />
        </CardContent>
        <Separator />
        <CardFooter>
          <Button className="w-full rounded-full">Создать новую команду</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChooseAgencyPage;
