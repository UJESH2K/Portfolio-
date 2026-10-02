"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, X } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Floating bottom-right launcher for freelance / meeting requests. Posts to
 * /api/requests, which stores the request in Supabase and emails the admin.
 */
export default function ScheduleWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      projectType: String(form.get("projectType") ?? ""),
      budget: String(form.get("budget") ?? ""),
      preferredDate: String(form.get("preferredDate") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("sent");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact form" : "Schedule a call"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-[0_0_30px_-6px_rgba(138,180,255,0.6)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="glass fixed bottom-24 right-6 z-50 w-[min(92vw,22rem)] rounded-2xl text-white shadow-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-[15px] font-medium">Let&apos;s work together</p>
            <p className="mono mt-1 text-white/45">
              Freelance work or a quick call — send the details and I&apos;ll get back to you.
            </p>
          </div>

          {status === "sent" ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[14px]">Sent. I&apos;ll reply by email shortly.</p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setOpen(false);
                }}
                className="mono mt-4 text-white underline decoration-white/30 underline-offset-4"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3 px-5 py-4">
              <input
                name="name"
                required
                placeholder="Your name"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] outline-none placeholder:text-white/30 focus:border-accent/60"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] outline-none placeholder:text-white/30 focus:border-accent/60"
              />
              <input
                name="company"
                placeholder="Company (optional)"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] outline-none placeholder:text-white/30 focus:border-accent/60"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="projectType"
                  defaultValue=""
                  className="rounded-lg border border-white/15 bg-ink px-3 py-2 text-[13px] outline-none focus:border-accent/60"
                >
                  <option value="" disabled>
                    Project type
                  </option>
                  <option>Freelance work</option>
                  <option>Full-time role</option>
                  <option>Quick call</option>
                  <option>Other</option>
                </select>
                <input
                  name="budget"
                  placeholder="Budget (optional)"
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[13px] outline-none placeholder:text-white/30 focus:border-accent/60"
                />
              </div>
              <input
                name="preferredDate"
                placeholder="Preferred date/time (optional)"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] outline-none placeholder:text-white/30 focus:border-accent/60"
              />
              <textarea
                name="message"
                required
                rows={3}
                placeholder="What do you need?"
                className="resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] outline-none placeholder:text-white/30 focus:border-accent/60"
              />

              {status === "error" && <p className="mono text-red-400">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mono mt-1 rounded-lg bg-accent py-2.5 text-center text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send request"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
