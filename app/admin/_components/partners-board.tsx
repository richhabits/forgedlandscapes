"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerRow } from "@/lib/admin-data";
import { PARTNER_KIND_LABELS, PARTNER_KINDS, label } from "@/lib/labels";
import { Button } from "@/components/ui/button";

export function PartnersBoard({ partners, isDemo }: { partners: PartnerRow[]; isDemo: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("all");
  const [editing, setEditing] = useState<PartnerRow | "new" | null>(null);

  const filtered = useMemo(
    () => (kind === "all" ? partners : partners.filter((p) => p.kind === kind)),
    [partners, kind]
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of partners) c[p.kind] = (c[p.kind] ?? 0) + 1;
    return c;
  }, [partners]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={kind === "all"} onClick={() => setKind("all")}>All ({partners.length})</Chip>
          {PARTNER_KINDS.filter((k) => counts[k]).map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
              {PARTNER_KIND_LABELS[k]} ({counts[k]})
            </Chip>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="size-3.5 mr-1.5" /> Add partner
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-500 text-sm border rule rounded-[2px] py-12 text-center">
          {partners.length === 0 ? "Add subcontractors, suppliers and referral partners here." : "None in this category."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              className={cn(
                "text-left border rule rounded-[2px] bg-forge-900 p-4 hover:border-bone-100/30 transition-colors cursor-pointer",
                !p.active && "opacity-50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] text-bone-50 font-medium truncate">{p.name}</p>
                  {p.company && <p className="text-[12px] text-stone-400 truncate">{p.company}</p>}
                </div>
                <span className="shrink-0 microlabel !text-[9px]">{label(PARTNER_KIND_LABELS, p.kind)}</span>
              </div>
              {p.trade && <p className="text-[12.5px] text-brass-300/90 mt-2">{p.trade}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-[11.5px] text-stone-400">
                {p.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" /> {p.phone}</span>}
                {p.email && <span className="inline-flex items-center gap-1 truncate"><Mail className="size-3" /> {p.email}</span>}
              </div>
              {p.notes && <p className="text-[12px] text-stone-500 mt-2 leading-snug line-clamp-2">{p.notes}</p>}
            </button>
          ))}
        </div>
      )}

      {editing && (
        <PartnerEditor
          partner={editing === "new" ? null : editing}
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

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-[2px] border text-[11.5px] transition-colors cursor-pointer",
        active ? "border-brass-400 bg-brass-500/10 text-brass-300" : "border-bone-100/12 text-stone-400 hover:border-bone-100/30"
      )}
    >
      {children}
    </button>
  );
}

function PartnerEditor({
  partner,
  isDemo,
  onClose,
  onSaved,
}: {
  partner: PartnerRow | null;
  isDemo: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: partner?.name ?? "",
    company: partner?.company ?? "",
    kind: partner?.kind ?? "subcontractor",
    trade: partner?.trade ?? "",
    phone: partner?.phone ?? "",
    email: partner?.email ?? "",
    active: partner?.active ?? true,
    notes: partner?.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function save() {
    if (!f.name.trim()) return;
    if (isDemo) return setFlash("Demo mode — not saved.");
    setBusy(true);
    const res = await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: partner?.id, ...f }),
    });
    setBusy(false);
    if (res.ok) onSaved();
    else setFlash("Couldn't save — try again.");
  }

  async function remove() {
    if (!partner || isDemo) return isDemo ? setFlash("Demo mode — not saved.") : undefined;
    setBusy(true);
    const res = await fetch(`/api/admin/partners?id=${partner.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-forge-950/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-forge-900 border-l rule h-dvh overflow-y-auto thin-scroll p-6 animate-fade-up">
        <h3 className="font-display text-xl text-bone-50 mb-5">{partner ? "Edit partner" : "Add partner"}</h3>
        <div className="space-y-4">
          <Field label="Name *"><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Company"><input className="field" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
          <Field label="Type">
            <select className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              {PARTNER_KINDS.map((k) => <option key={k} value={k}>{PARTNER_KIND_LABELS[k]}</option>)}
            </select>
          </Field>
          <Field label="Trade / what they do"><input className="field" placeholder="e.g. Groundworks & drainage" value={f.trade} onChange={(e) => setF({ ...f, trade: e.target.value })} /></Field>
          <Field label="Phone"><input className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Notes"><textarea rows={2} className="field resize-y" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          <label className="flex items-center gap-2.5 text-[13px] text-stone-400 cursor-pointer">
            <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="accent-[#b08a49]" />
            Active
          </label>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button size="sm" disabled={busy || !f.name.trim()} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          {partner && (
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
