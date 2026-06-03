"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (!result || result.error) {
      setLoading(false);
      setError("Email ou mot de passe invalide.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-white/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/30"
          placeholder="admin@rosefa.fr"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/70">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-white/30"
          placeholder="Ton mot de passe"
          required
        />
      </div>

      {error ? <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md border border-rose-400/30 bg-rose-500/14 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/22 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
