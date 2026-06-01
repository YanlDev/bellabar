"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left: Logo — hidden on mobile */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-black border-r border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 rounded-full bg-[oklch(0.82_0.12_85/0.03)] blur-3xl" />
        </div>
        <img
          src="/Logo/logo2.png"
          alt="Bella Barbara"
          className="relative z-10 w-80 object-contain opacity-90"
        />
      </div>

      {/* Right: Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Logo small for mobile */}
          <div className="md:hidden flex flex-col items-center gap-3 mb-8">
            <img src="/Logo/logo2.png" alt="" className="h-20 object-contain" />
            <p className="text-xs uppercase tracking-[0.2em] text-[oklch(0.72_0.12_85)]">
              Panel Administrativo
            </p>
          </div>

          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-[0.2em]">
              Panel Administrativo
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] uppercase tracking-wider font-medium text-zinc-500">
                Correo
              </label>
              <input
                id="email" name="email" type="email" placeholder="admin@academia.pe" required
                className="flex h-11 w-full border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[oklch(0.72_0.12_85/0.5)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[11px] uppercase tracking-wider font-medium text-zinc-500">
                Contraseña
              </label>
              <input
                id="password" name="password" type="password" placeholder="••••••••" required
                className="flex h-11 w-full border border-zinc-800 bg-zinc-950 px-4 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[oklch(0.72_0.12_85/0.5)]"
              />
            </div>

            {state?.error && (
              <div className="border border-[oklch(0.48_0.16_20/0.3)] bg-[oklch(0.48_0.16_20/0.08)] px-4 py-2.5">
                <p className="text-xs text-[oklch(0.62_0.12_22)]">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex h-11 w-full items-center justify-center bg-[oklch(0.72_0.12_85)] text-sm font-semibold text-black transition-all hover:bg-[oklch(0.68_0.13_83)] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
