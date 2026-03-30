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
import { useAuth } from "@/src/shared/providers/authProvider";

const AgencyAuth = () => {
  const [isSignUp, setSignUp] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);

  const { session } = useAuth();
  console.log(session);

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
            <FormSignUp action={submit} />
          ) : (
            <FormSignIn action={submit} />
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            onClick={() => {
              setSubmit(true);
              setTimeout(() => setSubmit(false), 200);
            }}
            className="flex-1"
            size="sm"
          >
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
