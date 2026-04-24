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

interface FormSignUpType {
  action?: boolean;
}

const FormSignUp: React.FC<FormSignUpType> = ({ action }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Error, setError] = useState("");
  const [hasSent, setHasSent] = useState<boolean>(false);

  const handleSubmitSignUp = useCallback(async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user?.confirmation_sent_at) {
      setHasSent(true);
    }

    if (error) {
      setError(error.message === "Invalid login credentials" ? "Неверный логин или пароль" : error.message);
    } else {
      setError("");
      console.log("Успешный вход:", data.user);
      redirect("/agency");
    }
  }, [email, password]);

  useEffect(() => {
    if (action) {
      const id = window.setTimeout(() => {
        handleSubmitSignUp();
      }, 0);

      return () => window.clearTimeout(id);
    }
  }, [action, handleSubmitSignUp]);

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
              placeholder="newemail@gmail.com"
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
        {hasSent && (
          <p className="pt-4 font-semibold">
            Подтверждение отправлено на почту.
          </p>
        )}
        {Error?.length > 0 && (
          <p className="text-red-600 pt-4">{Error}</p>
        )}
      </form>
    </div>
  );
};

export default FormSignUp;
