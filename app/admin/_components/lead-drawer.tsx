"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X, Phone, Mail, ArrowRight, ExternalLink, Video } from "lucide-react";
import { newVideoRoom } from "@/lib/call";
import { cn } from "@/lib/utils";
import type { LeadDetail, StaffRow } from "@/lib/admin-data";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_NEXT,
  LEAD_SOURCE_LABELS,
  PROJECT_TYPE_LABELS,
  BUDGET_LABELS,
  TIMELINE_LABELS,
  label,
  timeAgo,
} from "@/lib/labels";
import { StatusChip } from "./status-chip";
import { Button } from "@/components/ui/button";

const REPLY_TEMPLATES = [
  { key: "book_call", label: "Book the 15-min call" },
  { key: "survey_slots", label: "Offer survey slots" },
  { key: "out_of_area", label: "Out-of-area waitlist" },
] as const;

export function LeadDrawer({
  leadId,
  staff,
  isDemo,
  onClose,
  onMutated,
}: {
  leadId: string;
  staff: StaffRow[];
  isDemo: boolean;
  onClose: () => void;
  onMutated: () => void;
}) {
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/lead?id=${encodeURIComponent(leadId)}`);
    const json = await res.json().catch(() => null);
    setDetail(json?.lead ?? null);
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function mutate(body: Record<string, unknown>, okMsg: string) {
    if (isDemo) {
      setFlash("Demo mode — action not saved.");
      return;
    }
    setBusy(true);
    setFlash(null);
    const res = await fetch("/api/admin/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, ...body }),
    });
    setBusy(false);
    if (res.ok) {
      setFlash(okMsg);
      setNote("");
      await load();
      onMutated();
    } else {
      setFlash("Couldn't save — try again.");
    }
  }

  const next = detail ? LEAD_STATUS_NEXT[detail.status] : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-forge-950/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-forge-900 border-l rule h-dvh overflow-y-auto thin-scroll shadow-2xl animate-fade-up">
        {/* header */}
        <div className="sticky top-0 z-10 bg-forge-900/95 backdrop-blur-sm border-b rule px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {loading || !detail ? (
              <p className="text-stone-500 text-sm animate-pulse">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-display text-xl text-bone-50 truncate">{detail.name || detail.email}</h2>
                  <StatusChip status={detail.status} />
                </div>
                <p className="text-[12px] text-stone-500 mt-1">
                  {label(LEAD_SOURCE_LABELS, detail.source)} · {timeAgo(detail.created_at)}
                </p>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-bone-100 transition-colors cursor-pointer shrink-0" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        {detail && (
          <div className="px-5 py-5 space-y-6">
            {/* quick actions */}
            <div className="flex flex-wrap gap-2">
              {detail.phone && (
                <a href={`tel:${detail.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 h-9 px-3 rounded-[2px] border border-brass-600/50 bg-brass-500/10 text-brass-300 text-[12px] font-semibold uppercase tracking-[0.08em]">
                  <Phone className="size-3.5" /> Call
                </a>
              )}
              <a href={`mailto:${detail.email}`} className="flex items-center gap-2 h-9 px-3 rounded-[2px] border rule text-stone-300 text-[12px] font-semibold uppercase tracking-[0.08em] hover:border-bone-100/35 transition-colors">
                <Mail className="size-3.5" /> Email
              </a>
              <button
                onClick={() => window.open(newVideoRoom(), "_blank", "noopener")}
                className="flex items-center gap-2 h-9 px-3 rounded-[2px] border rule text-stone-300 text-[12px] font-semibold uppercase tracking-[0.08em] hover:border-bone-100/35 transition-colors cursor-pointer"
              >
                <Video className="size-3.5" /> Video
              </button>
              {detail.project && (
                <Link href={`/admin/projects/${detail.project.id}`} className="flex items-center gap-2 h-9 px-3 rounded-[2px] border rule text-stone-300 text-[12px] font-semibold uppercase tracking-[0.08em] hover:border-bone-100/35 transition-colors">
                  View brief <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>

            {/* record */}
            <dl className="divide-y divide-bone-100/8 border-y rule text-[13px]">
              <Row k="Email">
                <a href={`mailto:${detail.email}`} className="text-brass-300 underline underline-offset-2 break-all">{detail.email}</a>
              </Row>
              {detail.phone && <Row k="Phone"><a href={`tel:${detail.phone.replace(/\s/g, "")}`} className="text-brass-300">{detail.phone}</a></Row>}
              <Row k="Postcode">
                {detail.postcode}
                {detail.in_area === false ? <span className="text-danger ml-2 text-[11px] uppercase tracking-wide">Out of area</span> : detail.distance_miles != null ? <span className="text-stone-500 ml-2">{detail.distance_miles} mi from base</span> : null}
              </Row>
              <Row k="Project">{label(PROJECT_TYPE_LABELS, detail.project_type)}</Row>
              <Row k="Budget">{label(BUDGET_LABELS, detail.budget_band)}</Row>
              <Row k="Timeline">{label(TIMELINE_LABELS, detail.timeline)}</Row>
              {detail.referred_by && (
                <Row k="Referred by"><span className="text-brass-300">{detail.referred_by}</span></Row>
              )}
              {detail.meta && (detail.meta.landing || detail.meta.utm_source || detail.meta.referrer) && (
                <Row k="Came from">
                  <span className="text-[12px] text-stone-400">
                    {detail.meta.landing ? `${detail.meta.landing}` : ""}
                    {detail.meta.utm_source ? ` · ${detail.meta.utm_source}${detail.meta.utm_medium ? "/" + detail.meta.utm_medium : ""}` : ""}
                    {detail.meta.utm_campaign ? ` · ${detail.meta.utm_campaign}` : ""}
                    {!detail.meta.landing && !detail.meta.utm_source && detail.meta.referrer ? detail.meta.referrer : ""}
                  </span>
                </Row>
              )}
              {detail.message && <Row k="Message"><span className="text-bone-100/90 leading-relaxed">{detail.message}</span></Row>}
            </dl>

            {/* transcript */}
            {detail.transcript && detail.transcript.length > 0 && (
              <div>
                <p className="microlabel mb-3">Assessor transcript</p>
                <div className="space-y-2">
                  {detail.transcript.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-[13px] leading-relaxed px-3 py-2 rounded-[2px] max-w-[85%]",
                        m.role === "user"
                          ? "bg-brass-500/10 border border-brass-600/30 text-bone-100 ml-auto"
                          : "bg-bone-100/[0.04] border rule text-stone-300"
                      )}
                    >
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* advance + templated replies */}
            <div className="space-y-3">
              <p className="microlabel">Actions</p>
              {staff.length > 0 && (
                <div>
                  <label className="microlabel !normal-case !tracking-normal !text-[11.5px] !text-stone-500 block mb-1.5">Assigned to</label>
                  <select
                    className="field"
                    value={detail.assigned_to ?? ""}
                    disabled={busy}
                    onChange={(e) => mutate({ assigned_to: e.target.value || null }, e.target.value ? "Assigned" : "Unassigned")}
                  >
                    <option value="">Unassigned</option>
                    {staff.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {next && (
                <Button size="sm" disabled={busy} onClick={() => mutate({ status: next }, `Advanced to ${LEAD_STATUS_LABELS[next]}`)}>
                  Advance → {LEAD_STATUS_LABELS[next]}
                </Button>
              )}
              <div className="flex flex-wrap gap-2">
                {REPLY_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    disabled={busy}
                    onClick={() => mutate({ reply: t.key }, `Sent: ${t.label}`)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-[2px] border rule text-[11.5px] text-stone-300 hover:border-bone-100/35 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Mail className="size-3" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* note */}
            <div>
              <label htmlFor="lead-note" className="microlabel block mb-2">Add a note</label>
              <textarea
                id="lead-note"
                rows={2}
                className="field resize-y"
                placeholder="Called back, keen — sending portal link…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-3">
                <Button size="sm" variant="outline" disabled={busy || !note.trim()} onClick={() => mutate({ note: note.trim() }, "Note saved")}>
                  Save note
                </Button>
                {flash && <span className="text-[12px] text-moss-400">{flash}</span>}
              </div>
            </div>

            {/* history */}
            {detail.events.length > 0 && (
              <div>
                <p className="microlabel mb-3">History</p>
                <ul className="space-y-2.5">
                  {detail.events.map((e) => (
                    <li key={e.id} className="flex gap-3 text-[12.5px]">
                      <span className="text-stone-600 shrink-0 w-16">{timeAgo(e.created_at)}</span>
                      <span className="text-stone-300">
                        {e.note || e.kind}
                        {e.actor ? <span className="text-stone-600"> · {e.actor}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail.project && (
              <Link href={`/admin/projects/${detail.project.id}`} className="flex items-center justify-between border rule rounded-[2px] px-4 py-3 hover:border-bone-100/35 transition-colors">
                <span className="text-[13px] text-bone-100">Linked brief: {detail.project.title || "Untitled"}</span>
                <ExternalLink className="size-4 text-brass-400" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5 grid grid-cols-3 gap-3">
      <dt className="microlabel !normal-case !tracking-normal !text-[11.5px] !text-stone-500">{k}</dt>
      <dd className="col-span-2 text-bone-100/90">{children}</dd>
    </div>
  );
}
