"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AdminTable } from "@/lib/adminTables";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "checkbox" | "image" | "tags" | "number";
  options?: string[];
  placeholder?: string;
};

type Row = Record<string, any>;

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

function emptyForm(fields: Field[]): Row {
  const row: Row = {};
  for (const f of fields) {
    row[f.key] = f.type === "checkbox" ? false : "";
  }
  return row;
}

function toFormValue(row: Row, field: Field) {
  const v = row[field.key];
  if (field.type === "tags") return Array.isArray(v) ? v.join(", ") : v ?? "";
  return v ?? (field.type === "checkbox" ? false : "");
}

function toSubmitValue(value: any, field: Field) {
  if (field.type === "tags") {
    return String(value)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (field.type === "number") {
    return value === "" || value === null || value === undefined ? 0 : Number(value);
  }
  return value;
}

export default function ContentEditor({
  table,
  fields,
  titleKey,
  subtitleKey,
}: {
  table: AdminTable;
  fields: Field[];
  titleKey: string;
  subtitleKey?: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Row>(emptyForm(fields));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api(`/api/admin/content/${table}`);
      setRows(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  function startEdit(row: Row) {
    setEditingId(row.id);
    const next: Row = {};
    for (const f of fields) next[f.key] = toFormValue(row, f);
    setForm(next);
  }

  function startNew() {
    setEditingId(null);
    setForm(emptyForm(fields));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Row = {};
      for (const f of fields) payload[f.key] = toSubmitValue(form[f.key], f);

      if (editingId) {
        await api(`/api/admin/content/${table}/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/api/admin/content/${table}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      startNew();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await api(`/api/admin/content/${table}/${id}`, { method: "DELETE" });
      if (editingId === id) startNew();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onImageUpload(field: Field, file: File) {
    setUploading(field.key);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, [field.key]: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium">
            {editingId ? "Edit entry" : "New entry"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={startNew}
              className="mono text-xs text-white/50 underline underline-offset-4 hover:text-white"
            >
              cancel edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 border border-white/15 p-4">
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-[13px]">
              <span className="mono text-white/50">{f.label}</span>

              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={form[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="resize-none border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/40"
                />
              ) : f.type === "select" ? (
                <select
                  value={form[f.key] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="border border-white/15 bg-black px-3 py-2 outline-none focus:border-white/40"
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                  className="h-4 w-4"
                />
              ) : f.type === "image" ? (
                <div className="flex items-center gap-3">
                  {form[f.key] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form[f.key]} alt="" className="h-12 w-12 object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(f, file);
                    }}
                    className="mono text-xs"
                  />
                  {uploading === f.key && <span className="mono text-xs text-white/40">uploading…</span>}
                </div>
              ) : (
                <input
                  type="text"
                  value={form[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/40"
                />
              )}
            </label>
          ))}

          {error && <p className="mono text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mono mt-1 bg-white py-2.5 text-center text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-medium">
          {loading ? "Loading…" : `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
        </h2>
        <ul className="flex flex-col gap-px border border-white/15 bg-white/15">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 bg-black px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px]">{row[titleKey]}</p>
                {subtitleKey && (
                  <p className="mono truncate text-xs text-white/40">{row[subtitleKey]}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="mono text-xs text-white/60 underline underline-offset-4 hover:text-white"
                >
                  edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="mono text-xs text-red-400/80 underline underline-offset-4 hover:text-red-400"
                >
                  delete
                </button>
              </div>
            </li>
          ))}
          {!loading && rows.length === 0 && (
            <li className="bg-black px-4 py-6 text-center text-white/40">Nothing here yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
