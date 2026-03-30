import React, { useCallback, useEffect, useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/src/shared/api/supabase/client";
import { redirect } from "next/navigation";

interface FormSignInType {
  action: boolean;
}

const FormSignIn: React.FC<FormSignInType> = ({ action }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Error, setError] = useState("");

  const handleSubmitSignIn = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("Успешный вход:", data.user);
      setError("");
      redirect("/agency");
    }
  }, [email, password]);

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
            <FieldDescription>
              Укажите почту, на нее прийдет подтверждение
            </FieldDescription>
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
        {Error && (
          <p className="text-red-600 pt-4">{"Ошибка входа: " + Error}</p>
        )}
      </form>
    </div>
  );
};

export default FormSignIn;
