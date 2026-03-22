"use client";

import { useState } from "react";
import { supabase } from "@/src/shared/api/supabase/client";

export const RegisterForm = ({
  onRegistered,
}: {
  onRegistered?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      setMessage(`Ошибка регистрации: ${error.message}`);
      return;
    }

    // Если включено подтверждение email, сессии может не быть до подтверждения.
    // Для локальной разработки можно временно отключить email-confirmation в Supabase.
    if (data.session) {
      setMessage("Регистрация успешна. Вы вошли в систему.");
      onRegistered?.();
    } else {
      setMessage(
        "Регистрация успешна. Проверьте email для подтверждения аккаунта.",
      );
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        Зарегистрироваться
      </button>
      {message ? <p className="mt-2 text-xs">{message}</p> : null}
    </form>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Ошибка входа: " + error.message);
    } else {
      console.log("Успешный вход:", data.user);
      console.log("user.id (auth.uid):", data.user?.id);
      // После этого Supabase сохранит сессию в LocalStorage автоматически
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Войти как админ</button>
    </form>
  );
};
