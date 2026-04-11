"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FormSignIn from "@/src/features/auth/FormSignIn";
import { Separator } from "@/components/ui/separator";
import FormSignUp from "@/src/features/auth/FormSignUp";
import { Spinner } from "@/components/ui/spinner";

const AgencyAuth = () => {
  const [isSignUp, setSignUp] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  console.log(isLoading);

  return (
    <div className="w-full mb-20">
      <Card
        size="sm"
        className={`${isSignUp && "bg-brand-400/10"} mx-auto w-full max-w-sm`}
      >
        <CardHeader>
          <CardTitle className="text-xl!">
            {isSignUp ? "Зарегистрируйтесь" : "Войдите в аккаунт"}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          {isSignUp ? (
            <FormSignUp setState={setLoading} action={submit} />
          ) : (
            <FormSignIn setState={setLoading} action={submit} />
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            disabled={isLoading}
            onClick={() => {
              setSubmit(true);
              setTimeout(() => setSubmit(false), 200);
            }}
            className="flex-1"
            size="sm"
          >
            {isLoading && <Spinner />}
            {isSignUp ? "Регистрация" : "Войти"}
          </Button>
          <Button
            onClick={() => setSignUp((prev) => !prev)}
            className="flex-1"
            variant="outline"
            size="sm"
          >
            {isSignUp ? "Уже есть аккаунт" : "Регистрация"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgencyAuth;
