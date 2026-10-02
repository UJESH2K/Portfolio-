"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/admin/requests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xs border border-white/15 p-6"
      >
        <p className="mono text-white/50">Admin</p>
        <h1 className="mt-1 text-xl font-medium">Sign in</h1>

        <label className="mt-6 flex flex-col gap-1 text-[13px]">
          <span className="mono text-white/50">ID</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            className="border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/40"
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-[13px]">
          <span className="mono text-white/50">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/40"
          />
        </label>

        {error && <p className="mono mt-4 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mono mt-6 w-full bg-white py-2.5 text-center text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
