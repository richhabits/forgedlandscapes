"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffRow, TeamMessage } from "@/lib/admin-data";
import {
  STAFF_ROLE_LABELS,
  STAFF_ROLES,
  STAFF_STATUS_LABELS,
  STAFF_STATUSES,
  staffStatusTone,
  label,
  timeAgo,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";

const STATUS_TONE: Record<string, string> = {
  go: "border-moss-600/60 bg-moss-600/15 text-moss-400",
  moving: "border-brass-600/50 bg-brass-500/12 text-brass-300",
  onsite: "border-brass-400 bg-brass-500/20 text-brass-200",
  off: "border-bone-100/10 bg-forge-800 text-stone-500",
};

export function TeamBoard({
  staff,
  messages,
  isDemo,
}: {
  staff: StaffRow[];
  messages: TeamMessage[];
  isDemo: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<StaffRow | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  async function post(body: Record<string, unknown>) {
    if (isDemo) return true;
    setBusy(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    return res.ok;
  }

  const active = staff.filter((s) => s.active);

  return (
    <div className="space-y-10">
      {/* ——— where everyone is ——— */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="microlabel microlabel-brass">Right now</p>
            <h2 className="font-display text-2xl text-bone-50 mt-1">Where everyone is</h2>
          </div>
          {isDemo && <span className="microlabel microlabel-brass">Demo</span>}
        </div>
        {active.length === 0 ? (
          <p className="text-stone-500 text-sm border rule rounded-[2px] py-10 text-center">
            Add your team below, then set who's available, on the way, or on site.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <div key={s.id} className="border rule rounded-[2px] bg-forge-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] text-bone-50 font-medium truncate">{s.name}</p>
                    <p className="microlabel mt-0.5">{label(STAFF_ROLE_LABELS, s.role)}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-[2px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]", STATUS_TONE[staffStatusTone(s.status)])}>
                    {STAFF_STATUS_LABELS[s.status]}
                  </span>
                </div>
                {s.status_note && s.status !== "off" && (
                  <p className="text-[12.5px] text-stone-300 mt-2 leading-snug">{s.status_note}</p>
                )}
                <p className="text-[10.5px] text-stone-600 mt-1.5">since {timeAgo(s.status_at)}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {STAFF_STATUSES.map((st) => (
                    <button
                      key={st}
                      disabled={busy || s.status === st}
                      onClick={() => post({ id: s.id, status: st })}
                      className={cn(
                        "px-2 py-1 rounded-[2px] border text-[10.5px] transition-colors cursor-pointer disabled:cursor-default",
                        s.status === st
                          ? "border-brass-400 bg-brass-500/10 text-brass-300"
                          : "border-bone-100/12 text-stone-400 hover:border-bone-100/30"
                      )}
                    >
                      {STAFF_STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-brass-300">
                    <Phone className="size-3" /> {s.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ——— the team (directory) ——— */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl text-bone-50">The team</h2>
          <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
            <Plus className="size-3.5 mr-1.5" /> Add someone
          </Button>
        </div>
        <ul className="divide-y divide-bone-100/8 border-y rule">
          {staff.map((s) => (
            <li key={s.id} className="py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className={cn("text-[14px] font-medium truncate", s.active ? "text-bone-50" : "text-stone-500 line-through")}>{s.name}</p>
                <p className="text-[12px] text-stone-500 truncate">
                  {label(STAFF_ROLE_LABELS, s.role)}
                  {s.phone ? ` · ${s.phone}` : ""}{s.email ? ` · ${s.email}` : ""}
                </p>
              </div>
              <button onClick={() => setEditing(s)} className="text-[11.5px] text-stone-400 hover:text-bone-100 uppercase tracking-wider cursor-pointer">Edit</button>
            </li>
          ))}
          {staff.length === 0 && <li className="py-8 text-center text-stone-500 text-sm">No team members yet.</li>}
        </ul>
      </section>

      {/* ——— team chat ——— */}
      <TeamChat messages={messages} isDemo={isDemo} />

      {editing && (
        <StaffEditor
          staff={editing === "new" ? null : editing}
          isDemo={isDemo}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function TeamChat({ messages, isDemo }: { messages: TeamMessage[]; isDemo: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!body.trim()) return;
    if (isDemo) {
      setBody("");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "team", body: body.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      setBody("");
      router.refresh();
    }
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-bone-50 mb-4">Team chat</h2>
      <div className="border rule rounded-[2px] bg-forge-900">
        <div className="max-h-80 overflow-y-auto thin-scroll p-4 space-y-3 flex flex-col-reverse">
          {messages.length === 0 ? (
            <p className="text-stone-500 text-[13px] text-center py-6">No messages yet — say hello to the team.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="text-[13.5px]">
                <span className="text-brass-300 font-medium">{m.author.split("@")[0]}</span>
                <span className="text-stone-600 text-[11px] ml-2">{timeAgo(m.created_at)}</span>
                <p className="text-bone-100/90 leading-relaxed mt-0.5">{m.body}</p>
              </div>
            ))
          )}
        </div>
        <div className="border-t rule p-3 flex gap-2">
          <input
            className="field flex-1"
            placeholder="Message the team…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          />
          <Button size="md" disabled={busy || !body.trim()} onClick={send} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function StaffEditor({
  staff,
  isDemo,
  onClose,
  onSaved,
}: {
  staff: StaffRow | null;
  isDemo: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: staff?.name ?? "",
    role: staff?.role ?? "staff",
    phone: staff?.phone ?? "",
    email: staff?.email ?? "",
    active: staff?.active ?? true,
    notes: staff?.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function save() {
    if (!f.name.trim()) return;
    if (isDemo) {
      setFlash("Demo mode — not saved.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: staff?.id, ...f }),
    });
    setBusy(false);
    if (res.ok) onSaved();
    else setFlash("Couldn't save — try again.");
  }

  async function remove() {
    if (!staff || isDemo) {
      if (isDemo) setFlash("Demo mode — not saved.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/staff?id=${staff.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-forge-950/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-forge-900 border-l rule h-dvh overflow-y-auto thin-scroll p-6 animate-fade-up">
        <h3 className="font-display text-xl text-bone-50 mb-5">{staff ? "Edit team member" : "Add team member"}</h3>
        <div className="space-y-4">
          <Field label="Name *"><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Role">
            <select className="field" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
          <Field label="Phone"><input className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Notes"><textarea rows={2} className="field resize-y" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <label className="flex items-center gap-2.5 text-[13px] text-stone-400 cursor-pointer">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="accent-[#b08a49]" />
            Active (shows on the status board)
          </label>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button size="sm" disabled={busy || !f.name.trim()} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          {staff && (
            <button onClick={remove} disabled={busy} className="ml-auto text-[11.5px] text-danger hover:underline cursor-pointer uppercase tracking-wider">Delete</button>
          )}
        </div>
        {flash && <p className="mt-3 text-[12px] text-stone-400">{flash}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="microlabel block mb-1.5">{label}</span>
      {children}
    </div>
  );
}
