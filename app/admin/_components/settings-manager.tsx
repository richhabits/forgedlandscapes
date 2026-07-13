"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Database, KeyRound, Eye, EyeOff } from "lucide-react";
import type { AppSetting } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

export function SettingsManager({
  settings,
  sampleCount,
  isDemo,
}: {
  settings: AppSetting[];
  sampleCount: number;
  isDemo: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function sample(action: "seed" | "clear") {
    if (isDemo) return setFlash("Demo mode — not saved.");
    setBusy(action);
    const res = await fetch("/api/admin/sample-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(null);
    if (res.ok) {
      setFlash(action === "seed" ? "Sample data loaded." : "Sample data cleared.");
      router.refresh();
    } else setFlash("Something went wrong — try again.");
  }

  return (
    <div className="max-w-2xl space-y-12">
      {/* ——— sample / practice data ——— */}
      <section>
        <p className="microlabel microlabel-brass flex items-center gap-2"><Database className="size-3.5" /> Practice data</p>
        <h2 className="font-display text-2xl text-bone-50 mt-1.5 mb-3">Sample data for training</h2>
        <p className="text-[14px] text-stone-400 leading-relaxed mb-4">
          Load clearly-labelled sample staff, partners and leads so the team can practise —
          then clear it with one click. It <strong className="text-bone-100">never touches your real records</strong>.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {sampleCount > 0 ? (
            <>
              <span className="text-[13px] text-brass-300">Sample data is loaded.</span>
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => sample("clear")}>
                {busy === "clear" ? "Clearing…" : "Clear sample data"}
              </Button>
            </>
          ) : (
            <Button size="sm" disabled={busy !== null} onClick={() => sample("seed")}>
              {busy === "seed" ? "Loading…" : "Load sample data"}
            </Button>
          )}
          {flash && <span className="text-[12px] text-stone-400">{flash}</span>}
        </div>
      </section>

      {/* ——— integration keys ——— */}
      <section>
        <p className="microlabel microlabel-brass flex items-center gap-2"><KeyRound className="size-3.5" /> Integrations</p>
        <h2 className="font-display text-2xl text-bone-50 mt-1.5 mb-3">API keys & settings</h2>
        <p className="text-[13.5px] text-stone-400 leading-relaxed mb-4">
          Store keys and configuration here, editable any time. Only admins can read these.
          For maximum safety, truly sensitive secrets (payment, service-role) are still best kept
          as Vercel environment variables — use this for the rest.
        </p>
        <KeyList settings={settings} isDemo={isDemo} onChange={() => router.refresh()} />
      </section>
    </div>
  );
}

function KeyList({ settings, isDemo, onChange }: { settings: AppSetting[]; isDemo: boolean; onChange: () => void }) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      {settings.length > 0 && (
        <ul className="divide-y divide-bone-100/8 border-y rule mb-4">
          {settings.map((s) => (
            <KeyRow key={s.key} setting={s} isDemo={isDemo} onChange={onChange} />
          ))}
        </ul>
      )}
      {adding ? (
        <KeyForm isDemo={isDemo} onDone={() => { setAdding(false); onChange(); }} onCancel={() => setAdding(false)} />
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="size-3.5 mr-1.5" /> Add a key
        </Button>
      )}
    </div>
  );
}

function KeyRow({ setting, isDemo, onChange }: { setting: AppSetting; isDemo: boolean; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (isDemo) return;
    setBusy(true);
    await fetch(`/api/admin/settings?key=${encodeURIComponent(setting.key)}`, { method: "DELETE" });
    setBusy(false);
    onChange();
  }

  const masked = setting.is_secret && setting.value ? "•".repeat(Math.min(24, setting.value.length)) : setting.value;

  if (editing) {
    return <li className="py-3"><KeyForm setting={setting} isDemo={isDemo} onDone={() => { setEditing(false); onChange(); }} onCancel={() => setEditing(false)} /></li>;
  }

  return (
    <li className="py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] text-bone-50">{setting.label || setting.key}</p>
        <p className="text-[12px] text-stone-500 font-mono truncate">
          {setting.key} = {reveal ? setting.value : masked || "—"}
        </p>
      </div>
      {setting.is_secret && setting.value && (
        <button onClick={() => setReveal((r) => !r)} className="text-stone-500 hover:text-bone-100 cursor-pointer" aria-label="Reveal">
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
      <button onClick={() => setEditing(true)} className="text-[11.5px] text-stone-400 hover:text-bone-100 uppercase tracking-wider cursor-pointer">Edit</button>
      <button onClick={remove} disabled={busy} className="text-stone-500 hover:text-danger cursor-pointer" aria-label="Delete"><Trash2 className="size-4" /></button>
    </li>
  );
}

function KeyForm({ setting, isDemo, onDone, onCancel }: { setting?: AppSetting; isDemo: boolean; onDone: () => void; onCancel: () => void }) {
  const [key, setKey] = useState(setting?.key ?? "");
  const [label, setLabel] = useState(setting?.label ?? "");
  const [value, setValue] = useState(setting?.value ?? "");
  const [isSecret, setIsSecret] = useState(setting?.is_secret ?? true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!key.trim()) return;
    if (isDemo) return onCancel();
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), value, label: label || undefined, is_secret: isSecret }),
    });
    setBusy(false);
    if (res.ok) onDone();
    else { const j = await res.json().catch(() => null); setErr(j?.error || "Couldn't save."); }
  }

  return (
    <div className="border rule rounded-[2px] p-4 space-y-3 bg-forge-900">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <span className="microlabel block mb-1.5">Key</span>
          <input className="field !font-mono !text-[12.5px]" placeholder="OPENAI_API_KEY" value={key} disabled={!!setting} onChange={(e) => setKey(e.target.value)} />
        </div>
        <div>
          <span className="microlabel block mb-1.5">Label (optional)</span>
          <input className="field" placeholder="OpenAI key" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
      </div>
      <div>
        <span className="microlabel block mb-1.5">Value</span>
        <input className="field !font-mono !text-[12.5px]" type={isSecret ? "password" : "text"} value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <label className="flex items-center gap-2.5 text-[13px] text-stone-400 cursor-pointer">
        <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="accent-[#b08a49]" />
        Secret (hidden by default)
      </label>
      <div className="flex items-center gap-3">
        <Button size="sm" disabled={busy || !key.trim()} onClick={save}>{busy ? "Saving…" : "Save"}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        {err && <span className="text-[12px] text-danger">{err}</span>}
      </div>
    </div>
  );
}
