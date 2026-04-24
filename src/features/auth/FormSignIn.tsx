"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/src/shared/api/supabase/client";
import { useRouter } from "next/navigation";

interface FormSignInType {
  action: boolean;
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormSignIn: React.FC<FormSignInType> = ({ setState, action }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Error, setError] = useState("");
  const setLoadingState = useCallback(
    (value: boolean) => {
      setState?.(value);
    },
    [setState],
  );

  const handleSubmitSignIn = useCallback(async () => {
    setLoadingState(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Неверный логин или пароль"
          : error.message,
      );
    } else {
      setLoadingState(false);
      console.log("Успешный вход:", data.user);
      setError("");
      router.push("/agency");
    }
  }, [email, password, router, setLoadingState]);

  useEffect(() => {
    if (action) {
      const id = window.setTimeout(() => {
        handleSubmitSignIn();
      }, 0);

      return () => window.clearTimeout(id);
    }
  }, [action, handleSubmitSignIn]);

  return (
    <div className="w-full">
      <form>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="mail">Почта</FieldLabel>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              id="mail"
              type="mail"
              placeholder="youemail@gmail.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type="password"
              placeholder="••••••••"
            />
            <FieldDescription>Как минимум 8 символов</FieldDescription>
          </Field>
        </FieldGroup>
        {Error && <p className="text-red-600 pt-4">{Error}</p>}
      </form>
    </div>
  );
};

export default FormSignIn;
