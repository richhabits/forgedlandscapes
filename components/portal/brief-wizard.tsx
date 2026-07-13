"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { Check, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectTypeOptions, budgetOptions, timelineOptions } from "@/lib/services";
import { emptyBrief, briefArea, type Brief, type MediaItem } from "@/lib/portal-types";
import { SketchCanvas } from "@/components/portal/sketch-canvas";
import { Uploader } from "@/components/portal/uploader";
import { Button } from "@/components/ui/button";

const STEPS = [
  { key: "details", label: "The project" },
  { key: "dimensions", label: "Dimensions" },
  { key: "media", label: "Photos & video" },
  { key: "sketch", label: "Layout sketch" },
  { key: "inspiration", label: "Inspiration" },
  { key: "review", label: "Review & send" },
] as const;

type Backend =
  | { mode: "preview" }
  | { mode: "real"; client: SupabaseClient; user: User };

export function BriefWizard({
  backend,
  initialEmail,
}: {
  backend: Backend;
  initialEmail?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>({ ...emptyBrief });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectIdRef = useRef<string | null>(null);

  const set = useCallback(<K extends keyof Brief>(k: K, v: Brief[K]) => {
    setBrief((b) => ({ ...b, [k]: v }));
  }, []);

  /* ———————— persistence ———————— */

  const ensureProject = useCallback(async (): Promise<string | null> => {
    if (backend.mode === "preview") {
      projectIdRef.current = projectIdRef.current || `preview-${Math.random().toString(36).slice(2)}`;
      return projectIdRef.current;
    }
    if (projectIdRef.current) return projectIdRef.current;
    const { data, error } = await backend.client
      .from("projects")
      .insert({
        user_id: backend.user.id,
        project_type: brief.project_type || "other",
        title: brief.title || null,
        status: "draft",
      })
      .select("id")
      .single();
    if (error || !data) {
      setError("Couldn't start the brief — give it a second and try again.");
      return null;
    }
    projectIdRef.current = data.id;
    return data.id;
  }, [backend, brief.project_type, brief.title]);

  const persistFields = useCallback(
    async (b: Brief) => {
      if (backend.mode === "preview") return true;
      const id = await ensureProject();
      if (!id) return false;
      const { error } = await backend.client
        .from("projects")
        .update({
          project_type: b.project_type || "other",
          title: b.title || null,
          description: b.description || null,
          postcode: b.postcode ? b.postcode.toUpperCase() : null,
          length_m: parseFloat(b.length_m) || null,
          width_m: parseFloat(b.width_m) || null,
          budget_band: b.budget_band,
          timeline: b.timeline,
          details: {
            second_space: b.second_space || null,
            access_notes: b.access_notes || null,
            inspiration_links: b.inspirationLinks,
          },
        })
        .eq("id", id);
      if (error) {
        setError("Autosave hiccup — your inputs are still here; continue when ready.");
        return false;
      }
      return true;
    },
    [backend, ensureProject]
  );

  const uploadMedia = useCallback(
    async (file: File, kind: MediaItem["kind"]) => {
      const id = crypto.randomUUID();
      if (backend.mode === "preview") {
        const item: MediaItem = {
          id,
          kind,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };
        setBrief((b) => ({ ...b, media: [...b.media, item] }));
        return;
      }
      const projectId = await ensureProject();
      if (!projectId) throw new Error("no project");
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${backend.user.id}/${projectId}/${id}.${ext}`;
      const { error: upErr } = await backend.client.storage
        .from("project-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { error: rowErr } = await backend.client.from("project_media").insert({
        id,
        project_id: projectId,
        user_id: backend.user.id,
        kind,
        storage_path: path,
        caption: file.name,
      });
      if (rowErr) throw rowErr;
      const { data: signed } = await backend.client.storage
        .from("project-media")
        .createSignedUrl(path, 60 * 60);
      const item: MediaItem = {
        id,
        kind,
        storagePath: path,
        url: signed?.signedUrl,
        name: file.name,
        size: file.size,
      };
      setBrief((b) => ({ ...b, media: [...b.media, item] }));
    },
    [backend, ensureProject]
  );

  const removeMedia = useCallback(
    async (item: MediaItem) => {
      setBrief((b) => ({ ...b, media: b.media.filter((m) => m.id !== item.id) }));
      if (backend.mode === "real" && item.storagePath) {
        await backend.client.storage.from("project-media").remove([item.storagePath]);
        await backend.client.from("project_media").delete().eq("id", item.id);
      } else if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    },
    [backend]
  );

  const sketchExport = useCallback(
    async (blob: Blob) => {
      const file = new File([blob], `sketch-${Date.now()}.png`, { type: "image/png" });
      await uploadMedia(file, "sketch_canvas");
    },
    [uploadMedia]
  );

  const submit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const ok = await persistFields(brief);
      if (!ok && backend.mode === "real") return;

      if (backend.mode === "real") {
        const id = projectIdRef.current;
        const { error: subErr } = await backend.client
          .from("projects")
          .update({ status: "submitted", submitted_at: new Date().toISOString(), consent_given: true })
          .eq("id", id!);
        if (subErr) {
          setError("Submission didn't stick — try once more.");
          return;
        }
        const { data: sess } = await backend.client.auth.getSession();
        fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sess.session?.access_token || ""}`,
          },
          body: JSON.stringify({
            projectId: id,
            email: backend.user.email,
            title: brief.title || brief.project_type,
            project_type: brief.project_type || "other",
            area_m2: briefArea(brief),
            media_count: brief.media.length,
            postcode: brief.postcode || null,
          }),
        }).catch(() => {});
      }
      router.push("/portal/success");
    } finally {
      setSaving(false);
    }
  }, [backend, brief, persistFields, router]);

  /* ———————— step gating ———————— */

  const canContinue = useMemo(() => {
    if (step === 0) return brief.project_type && brief.description.trim().length >= 10;
    if (step === 5) return brief.consent;
    return true;
  }, [step, brief]);

  async function next() {
    setError(null);
    await persistFields(brief);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const photos = brief.media.filter((m) => m.kind === "garden_photo" || m.kind === "garden_video");
  const sketches = brief.media.filter((m) => m.kind === "sketch_canvas" || m.kind === "sketch_upload");
  const inspoMedia = brief.media.filter((m) => m.kind === "inspiration");
  const area = briefArea(brief);

  const label = "microlabel block mb-2";

  /* ———————— render ———————— */

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      {/* rail */}
      <aside className="lg:col-span-3">
        <ol className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {STEPS.map((s, i) => (
            <li key={s.key} className="shrink-0">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-[2px] transition-colors",
                  i === step && "bg-bone-100/[0.05]",
                  i < step ? "cursor-pointer" : i > step ? "opacity-40" : ""
                )}
              >
                <span
                  className={cn(
                    "size-6 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-semibold",
                    i < step
                      ? "border-brass-400 bg-brass-500 text-forge-950"
                      : i === step
                        ? "border-brass-400 text-brass-300"
                        : "border-bone-100/20 text-stone-500"
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[12.5px] tracking-[0.03em] whitespace-nowrap",
                    i === step ? "text-bone-50 font-medium" : "text-stone-400"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {backend.mode === "real" && (
          <p className="hidden lg:block mt-6 text-[11.5px] text-stone-600 leading-relaxed">
            Progress autosaves to your account
            {initialEmail ? ` (${initialEmail})` : ""} — leave and come back anytime.
          </p>
        )}
      </aside>

      {/* content */}
      <div className="lg:col-span-9 lg:max-w-2xl">
        {step === 0 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">What are we building?</h2>
            <div className="mt-6">
              <span className={label}>Project type *</span>
              <div className="flex flex-wrap gap-2">
                {projectTypeOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set("project_type", o.value)}
                    className={cn(
                      "px-4 py-2.5 border rounded-[2px] text-[13px] transition-colors cursor-pointer",
                      brief.project_type === o.value
                        ? "border-brass-400 bg-brass-500/10 text-brass-300"
                        : "border-bone-100/15 text-stone-400 hover:border-bone-100/35"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="bw-title" className={label}>Give it a name (optional)</label>
              <input
                id="bw-title"
                className="field"
                placeholder="e.g. Back garden overhaul"
                value={brief.title}
                maxLength={120}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="mt-6">
              <label htmlFor="bw-desc" className={label}>Describe the space and the goal *</label>
              <textarea
                id="bw-desc"
                rows={6}
                className="field resize-y"
                maxLength={4000}
                placeholder="What's there now, what's wrong with it, and what you want it to become. Mention slopes, drains, access, trees — the awkward stuff is the useful stuff."
                value={brief.description}
                onChange={(e) => set("description", e.target.value)}
              />
              <p className="mt-1.5 text-[11px] text-stone-600">{brief.description.trim().length < 10 ? "A sentence or two is enough to start." : `${brief.description.length} characters`}</p>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="bw-pc" className={label}>Property postcode</label>
                <input
                  id="bw-pc"
                  className="field"
                  placeholder="WD17 1AB"
                  autoComplete="postal-code"
                  maxLength={10}
                  value={brief.postcode}
                  onChange={(e) => set("postcode", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="bw-budget" className={label}>Budget band</label>
                <select id="bw-budget" className="field" value={brief.budget_band} onChange={(e) => set("budget_band", e.target.value)}>
                  {budgetOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bw-when" className={label}>Timeline</label>
                <select id="bw-when" className="field" value={brief.timeline} onChange={(e) => set("timeline", e.target.value)}>
                  {timelineOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">Rough dimensions</h2>
            <p className="text-[14px] text-stone-400 mt-3 leading-relaxed">
              Pace it out — a stride is about a metre. Close enough beats not-at-all,
              and we measure properly at survey.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-5 max-w-md">
              <div>
                <label htmlFor="bw-len" className={label}>Length (m)</label>
                <input
                  id="bw-len"
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  max="200"
                  step="0.5"
                  className="field"
                  value={brief.length_m}
                  onChange={(e) => set("length_m", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="bw-wid" className={label}>Width (m)</label>
                <input
                  id="bw-wid"
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  max="200"
                  step="0.5"
                  className="field"
                  value={brief.width_m}
                  onChange={(e) => set("width_m", e.target.value)}
                />
              </div>
            </div>
            {area && (
              <p className="mt-4 text-[14px] text-bone-100">
                ≈ <span className="font-display text-2xl text-brass-300">{area} m²</span>
                <span className="text-stone-500 text-[12.5px] ml-2">working area</span>
              </p>
            )}
            <div className="mt-6 max-w-md">
              <label htmlFor="bw-second" className={label}>A second space? (optional)</label>
              <input
                id="bw-second"
                className="field"
                placeholder="e.g. front garden approx 4m × 6m"
                maxLength={200}
                value={brief.second_space}
                onChange={(e) => set("second_space", e.target.value)}
              />
            </div>
            <div className="mt-6 max-w-md">
              <label htmlFor="bw-access" className={label}>Access notes (optional)</label>
              <textarea
                id="bw-access"
                rows={3}
                className="field resize-y"
                maxLength={500}
                placeholder="Side gate width, steps, shared drive, parking for a skip…"
                value={brief.access_notes}
                onChange={(e) => set("access_notes", e.target.value)}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">Show us the space</h2>
            <p className="text-[14px] text-stone-400 mt-3 leading-relaxed">
              Four angles beat forty: from the house looking out, from the end looking
              back, and the problem corners. A slow phone-video walkthrough is gold.
            </p>
            <div className="mt-6">
              <Uploader
                items={photos}
                kind="garden_photo"
                upload={uploadMedia}
                remove={removeMedia}
                label="Drop garden photos or video here"
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">Sketch the layout</h2>
            <p className="text-[14px] text-stone-400 mt-3 leading-relaxed">
              Draw the garden as a box, then blob in what goes where — patio here,
              lawn there, beds along the fence. Two colours and an eraser is all it takes.
            </p>
            <div className="mt-6">
              <SketchCanvas onExport={sketchExport} />
            </div>
            {sketches.length > 0 && (
              <p className="mt-4 text-[13px] text-moss-400 flex items-center gap-2">
                <Check className="size-4" /> {sketches.length} sketch{sketches.length > 1 ? "es" : ""} attached
              </p>
            )}
            <div className="mt-8 border-t rule pt-6">
              <p className={label}>Prefer paper? Photograph it instead</p>
              <Uploader
                items={sketches.filter((s) => s.kind === "sketch_upload")}
                kind="sketch_upload"
                accept="image/*"
                allowVideo={false}
                upload={uploadMedia}
                remove={removeMedia}
                label="Upload a photo of your paper sketch"
              />
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">What's the taste?</h2>
            <p className="text-[14px] text-stone-400 mt-3 leading-relaxed">
              Paste links — Pinterest boards, Instagram posts, anything — or upload
              screenshots. Three strong references beat thirty vague ones.
            </p>
            <div className="mt-6">
              <span className={label}>Links</span>
              <InspoLinks
                links={brief.inspirationLinks}
                onChange={(links) => set("inspirationLinks", links)}
              />
            </div>
            <div className="mt-8">
              <span className={label}>Or upload inspiration images</span>
              <Uploader
                items={inspoMedia}
                kind="inspiration"
                accept="image/*"
                allowVideo={false}
                upload={uploadMedia}
                remove={removeMedia}
                label="Drop inspiration images here"
              />
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h2 className="font-display text-3xl text-bone-50">Read it back</h2>
            <dl className="mt-6 divide-y divide-bone-100/8 border-y rule text-[14px]">
              {[
                ["Project", projectTypeOptions.find((o) => o.value === brief.project_type)?.label || "—"],
                ["Name", brief.title || "—"],
                ["Postcode", brief.postcode.toUpperCase() || "—"],
                ["Working area", area ? `≈ ${area} m² (${brief.length_m}m × ${brief.width_m}m)` : "To be measured at survey"],
                ["Second space", brief.second_space || "—"],
                ["Budget", budgetOptions.find((o) => o.value === brief.budget_band)?.label || "—"],
                ["Timeline", timelineOptions.find((o) => o.value === brief.timeline)?.label || "—"],
                ["Photos & video", String(photos.length)],
                ["Sketches", String(sketches.length)],
                ["Inspiration", `${brief.inspirationLinks.length} links, ${inspoMedia.length} images`],
              ].map(([k, v]) => (
                <div key={k} className="py-3 grid grid-cols-3 gap-4">
                  <dt className="microlabel !normal-case !tracking-normal !text-[12px]">{k}</dt>
                  <dd className="col-span-2 text-bone-100/90">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13.5px] text-stone-400 leading-relaxed">{brief.description}</p>

            <label className="mt-8 flex items-start gap-3 text-[13px] text-stone-400 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={brief.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-1 accent-[#b08a49]"
              />
              <span>
                I confirm the photos are mine to share and I'm happy for Forged Landscapes
                to contact me about this project. Handled per the{" "}
                <Link href="/privacy" className="text-brass-300 underline underline-offset-2">privacy policy</Link>. *
              </span>
            </label>
          </section>
        )}

        {error && (
          <p className="mt-5 text-[13px] text-danger" role="alert">{error}</p>
        )}

        <div className="mt-10 flex items-center gap-3">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="lg" onClick={next} disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button size="lg" onClick={submit} disabled={!canContinue || saving}>
              {saving ? "Sending…" : "Submit brief"}
            </Button>
          )}
          {step === 2 && photos.length === 0 && (
            <span className="text-[12px] text-stone-500">Photos can wait — but they halve the survey time.</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ——— inspiration link list ——— */

function InspoLinks({
  links,
  onChange,
}: {
  links: string[];
  onChange: (l: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function add() {
    setErr(null);
    let v = value.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
    try {
      const u = new URL(v);
      if (!u.hostname.includes(".")) throw new Error();
    } catch {
      setErr("That link doesn't look right.");
      return;
    }
    if (links.length >= 10) {
      setErr("Ten links is plenty — quality over quantity.");
      return;
    }
    onChange([...links, v]);
    setValue("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="field flex-1"
          placeholder="pinterest.com/yourboard…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} aria-label="Add link">
          <Plus className="size-4" />
        </Button>
      </div>
      {err && <p className="mt-2 text-[12.5px] text-danger">{err}</p>}
      {links.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {links.map((l) => (
            <li key={l} className="flex items-center gap-2.5 text-[13px] text-stone-400 border rule px-3 py-2">
              <Link2 className="size-3.5 text-brass-400 shrink-0" aria-hidden />
              <span className="truncate flex-1">{l}</span>
              <button
                type="button"
                className="text-stone-500 hover:text-danger transition-colors cursor-pointer text-[11px] uppercase tracking-wider"
                onClick={() => onChange(links.filter((x) => x !== l))}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
