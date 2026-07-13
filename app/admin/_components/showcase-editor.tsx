"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Showcase } from "@/lib/showcase";
import { Button } from "@/components/ui/button";

export function ShowcaseEditor({ items, isDemo }: { items: Showcase[]; isDemo: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Showcase | "new" | null>(null);

  return (
    <div className="max-w-3xl">
      <p className="text-[14px] text-stone-400 leading-relaxed mb-5">
        Add before/after pairs — paste image URLs (from your Supabase storage or any allowed host).
        Only <strong className="text-bone-100">published</strong> pairs show on the public{" "}
        <span className="text-brass-300">/work</span> page. Only publish photos you have consent to share.
      </p>
      <div className="mb-5">
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="size-3.5 mr-1.5" /> Add before/after
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="divide-y divide-bone-100/8 border-y rule">
          {items.map((it) => (
            <li key={it.id} className="py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-bone-50 truncate">{it.title}</p>
                <p className="text-[12px] text-stone-500">{it.location || "—"}</p>
              </div>
              <span className={cn("text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] border", it.published ? "border-moss-600/60 text-moss-400" : "border-bone-100/12 text-stone-500")}>
                {it.published ? "Published" : "Draft"}
              </span>
              <button onClick={() => setEditing(it)} className="text-[11.5px] text-stone-400 hover:text-bone-100 uppercase tracking-wider cursor-pointer">Edit</button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Editor item={editing === "new" ? null : editing} isDemo={isDemo} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />
      )}
    </div>
  );
}

function Editor({ item, isDemo, onClose, onSaved }: { item: Showcase | null; isDemo: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    title: item?.title ?? "",
    location: item?.location ?? "",
    before_url: item?.before_url ?? "",
    after_url: item?.after_url ?? "",
    caption: item?.caption ?? "",
    published: item?.published ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function save() {
    if (!f.title.trim()) return;
    if (isDemo) return setFlash("Demo mode — not saved.");
    setBusy(true);
    const res = await fetch("/api/admin/showcase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item?.id, ...f }),
    });
    setBusy(false);
    if (res.ok) onSaved();
    else setFlash("Couldn't save — try again.");
  }

  async function remove() {
    if (!item || isDemo) return isDemo ? setFlash("Demo mode — not saved.") : undefined;
    setBusy(true);
    await fetch(`/api/admin/showcase?id=${item.id}`, { method: "DELETE" });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-forge-950/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-forge-900 border-l rule h-dvh overflow-y-auto thin-scroll p-6 animate-fade-up">
        <h3 className="font-display text-xl text-bone-50 mb-5">{item ? "Edit" : "Add"} before/after</h3>
        <div className="space-y-4">
          <F label="Title *"><input className="field" placeholder="Sloped garden — Radlett" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></F>
          <F label="Location"><input className="field" placeholder="Radlett, WD7" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></F>
          <F label="Before image URL"><input className="field !text-[12px]" value={f.before_url} onChange={(e) => setF({ ...f, before_url: e.target.value })} /></F>
          <F label="After image URL"><input className="field !text-[12px]" value={f.after_url} onChange={(e) => setF({ ...f, after_url: e.target.value })} /></F>
          <F label="Caption"><textarea rows={3} className="field resize-y" value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} /></F>
          <label className="flex items-center gap-2.5 text-[13px] text-stone-400 cursor-pointer">
            <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} className="accent-[#b08a49]" />
            Published (show on /work)
          </label>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button size="sm" disabled={busy || !f.title.trim()} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          {item && <button onClick={remove} disabled={busy} className="ml-auto text-[11.5px] text-danger hover:underline cursor-pointer uppercase tracking-wider">Delete</button>}
        </div>
        {flash && <p className="mt-3 text-[12px] text-stone-400">{flash}</p>}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="microlabel block mb-1.5">{label}</span>{children}</div>;
}
