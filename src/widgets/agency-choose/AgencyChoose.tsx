"use client";

import React from "react";
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
import ChooseAgencyList from "./ui/ChooseAgencyList";
import CreateAgencyModal from "@/src/features/agencies/create-agency/CreateAgencyModal";

const ChooseAgencyCard = () => {
  return (
    <div className="size-full flex flex-col pb-20 items-center justify-center">
      <Card className="w-full" size="sm">
        <CardHeader className="text-center">
          <CardTitle className="font-semibold font-jost !text-2xl">
            Где работаем сегодня?
          </CardTitle>
          <CardDescription>
            Выберите команду из списка или создайте новую
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <ChooseAgencyList />
        </CardContent>
        <Separator />
        <CardFooter>
          <CreateAgencyModal text="Создайте новую команду" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChooseAgencyCard;
