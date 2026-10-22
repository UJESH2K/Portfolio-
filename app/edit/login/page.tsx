"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** Sign in to /edit: the fixed login in lib/auth.ts, with an attempt limit. */
export default function EditLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/edit");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-[#b8360c]">ujesh.in</p>
        <h1 className="mt-2 text-2xl font-semibold">Edit the site</h1>
        <label className="mt-6 flex flex-col gap-1 text-sm">
          <span className="text-[#5c5a55]">Username</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            className="rounded-lg border border-[#d9d5ca] px-3 py-2 outline-none focus:border-black"
          />
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="text-[#5c5a55]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="rounded-lg border border-[#d9d5ca] px-3 py-2 outline-none focus:border-black"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
