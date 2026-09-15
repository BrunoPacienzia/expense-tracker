"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CircleDollarSign } from "lucide-react";

export default function LoginForm({
  onLogin,
  setIsLogin,
}: {
  onLogin: (token: string) => void;
  setIsLogin: (value: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Email y contraseña requeridos");
      return;
    }
    const API_URL = "https://expense-tracker-api-7umy.onrender.com";
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error);
      return;
    }

    const data = await response.json();
    onLogin(data.token);
  };
  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Ingresá para continuar con el control de tus gastos."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-700">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-zinc-700">
            Contraseña
          </span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
          />
        </label>
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-700"
          type="submit"
        >
          Ingresar <ArrowRight className="size-4" />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        ¿No tenés una cuenta?{" "}
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="font-semibold text-zinc-950 hover:underline"
        >
          Registrate
        </button>
      </p>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f6] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-9">
        <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <CircleDollarSign className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
