"use client";

import { useEffect, useState } from "react";

type MeetingRequest = {
  id: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  project_type?: string;
  preferred_date?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
};

export default function RequestsAdminPage() {
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setRequests(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: MeetingRequest["status"]) {
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div>
      <h1 className="mb-1 text-lg font-medium">
        Meeting &amp; freelance requests
        {newCount > 0 && (
          <span className="mono ml-3 rounded-full bg-white px-2 py-0.5 text-xs text-black">
            {newCount} new
          </span>
        )}
      </h1>
      {error && <p className="mono mt-4 text-xs text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {loading && <p className="text-white/50">Loading…</p>}
        {!loading && requests.length === 0 && (
          <p className="text-white/50">No requests yet.</p>
        )}
        {requests.map((r) => (
          <div
            key={r.id}
            className={`border p-5 ${
              r.status === "new" ? "border-white/40" : "border-white/15"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-medium">
                  {r.name} <span className="mono text-white/40">— {r.email}</span>
                </p>
                <p className="mono mt-1 text-xs text-white/40">
                  {new Date(r.created_at).toLocaleString()}
                  {r.project_type ? ` · ${r.project_type}` : ""}
                  {r.company ? ` · ${r.company}` : ""}
                  {r.budget ? ` · budget: ${r.budget}` : ""}
                  {r.preferred_date ? ` · wants: ${r.preferred_date}` : ""}
                </p>
              </div>
              <select
                value={r.status}
                onChange={(e) => setStatus(r.id, e.target.value as MeetingRequest["status"])}
                className="border border-white/15 bg-black px-2 py-1 text-[13px]"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[14px] text-white/80">{r.message}</p>
            <a
              href={`mailto:${r.email}`}
              className="mono mt-3 inline-block text-xs text-white underline decoration-white/30 underline-offset-4"
            >
              Reply by email
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
