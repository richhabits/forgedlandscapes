"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, LayoutList, Columns, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadRow, StaffRow } from "@/lib/admin-data";
import {
  LEAD_STATUS_ORDER,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PROJECT_TYPE_LABELS,
  BUDGET_LABELS,
  label,
  timeAgo,
} from "@/lib/labels";
import { StatusChip } from "./status-chip";
import { LeadDrawer } from "./lead-drawer";

type View = "list" | "board";

export function LeadInbox({ leads, staff, isDemo }: { leads: LeadRow[]; staff: StaffRow[]; isDemo: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [area, setArea] = useState<"all" | "in" | "out">("all");
  const [view, setView] = useState<View>("list");
  const [openId, setOpenId] = useState<string | null>(null);

  const staffName = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of staff) m.set(s.id, s.name);
    return m;
  }, [staff]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (area === "in" && l.in_area !== true) return false;
      if (area === "out" && l.in_area !== false) return false;
      if (q) {
        const hay = `${l.name ?? ""} ${l.email} ${l.postcode} ${l.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, query, status, area]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  function exportCsv() {
    const cols = [
      "created_at", "name", "email", "phone", "postcode", "in_area", "distance_miles",
      "project_type", "budget_band", "timeline", "source", "status", "message",
    ] as const;
    const cell = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map((l) => cols.map((k) => cell((l as Record<string, unknown>)[k])).join(","));
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forged-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusFilters = ["all", ...LEAD_STATUS_ORDER.filter((s) => counts[s])];

  return (
    <section>
      {/* controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="field !pl-9"
            placeholder="Search name, email, postcode…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-[2px] border rule p-0.5">
          <ToggleBtn active={area === "all"} onClick={() => setArea("all")}>All</ToggleBtn>
          <ToggleBtn active={area === "in"} onClick={() => setArea("in")}>In area</ToggleBtn>
          <ToggleBtn active={area === "out"} onClick={() => setArea("out")}>Out</ToggleBtn>
        </div>
        <div className="flex items-center gap-1 rounded-[2px] border rule p-0.5">
          <ToggleBtn active={view === "list"} onClick={() => setView("list")} aria-label="List view">
            <LayoutList className="size-4" />
          </ToggleBtn>
          <ToggleBtn active={view === "board"} onClick={() => setView("board")} aria-label="Board view">
            <Columns className="size-4" />
          </ToggleBtn>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 h-10 px-3.5 rounded-[2px] border rule text-[12px] text-stone-400 hover:text-bone-100 hover:border-bone-100/35 transition-colors cursor-pointer"
        >
          <Download className="size-4" /> CSV
        </button>
      </div>

      {/* status chips */}
      <div className="flex flex-wrap gap-1.5 mb-5 thin-scroll">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "px-2.5 py-1 rounded-[2px] border text-[11.5px] tracking-[0.02em] transition-colors cursor-pointer whitespace-nowrap",
              status === s
                ? "border-brass-400 bg-brass-500/10 text-brass-300"
                : "border-bone-100/12 text-stone-400 hover:border-bone-100/30"
            )}
          >
            {s === "all" ? `All (${leads.length})` : `${LEAD_STATUS_LABELS[s]} (${counts[s]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-500 text-sm py-16 text-center border rule rounded-[2px]">
          No leads match — {leads.length === 0 ? "enquiries will land here the moment they arrive." : "try clearing the filters."}
        </p>
      ) : view === "list" ? (
        <ul className="divide-y divide-bone-100/8 border-y rule">
          {filtered.map((l) => (
            <li key={l.id}>
              <LeadListRow
                lead={l}
                assignee={l.assigned_to ? staffName.get(l.assigned_to) ?? null : null}
                onOpen={() => setOpenId(l.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <Board leads={filtered} onOpen={setOpenId} />
      )}

      {openId && (
        <LeadDrawer
          leadId={openId}
          staff={staff}
          isDemo={isDemo}
          onClose={() => setOpenId(null)}
          onMutated={() => router.refresh()}
        />
      )}
    </section>
  );
}

function LeadListRow({ lead, assignee, onOpen }: { lead: LeadRow; assignee: string | null; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left py-3.5 px-1 flex items-start gap-4 hover:bg-bone-100/[0.03] transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[14px] text-bone-50 font-medium truncate">{lead.name || lead.email}</span>
          <StatusChip status={lead.status} />
          {assignee && (
            <span className="text-[10.5px] uppercase tracking-[0.08em] text-brass-300/90">→ {assignee}</span>
          )}
          {lead.in_area === false && (
            <span className="text-[10.5px] uppercase tracking-[0.1em] text-danger font-semibold">Out of area</span>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-stone-400 truncate">
          {label(PROJECT_TYPE_LABELS, lead.project_type)} · {label(BUDGET_LABELS, lead.budget_band)} · {lead.postcode}
          {lead.distance_miles != null && lead.in_area !== false ? ` · ${lead.distance_miles} mi` : ""}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] text-stone-500">{timeAgo(lead.created_at)}</p>
        <p className="microlabel mt-1">{label(LEAD_SOURCE_LABELS, lead.source)}</p>
      </div>
    </button>
  );
}

function Board({ leads, onOpen }: { leads: LeadRow[]; onOpen: (id: string) => void }) {
  const cols = LEAD_STATUS_ORDER.filter((s) => leads.some((l) => l.status === s));
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 thin-scroll">
      {cols.map((s) => {
        const items = leads.filter((l) => l.status === s);
        return (
          <div key={s} className="shrink-0 w-[260px]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="microlabel">{LEAD_STATUS_LABELS[s]}</span>
              <span className="text-[11px] text-stone-500">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onOpen(l.id)}
                  className="w-full text-left border rule rounded-[2px] p-3 bg-forge-900 hover:border-bone-100/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 text-stone-600 shrink-0" />
                    <span className="text-[13px] text-bone-50 font-medium truncate">{l.name || l.email}</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-stone-400 truncate">
                    {label(PROJECT_TYPE_LABELS, l.project_type)} · {l.postcode}
                  </p>
                  <p className="mt-1.5 text-[10.5px] text-stone-500">{timeAgo(l.created_at)}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ToggleBtn({
  active,
  children,
  onClick,
  ...rest
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-2.5 rounded-[2px] text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer",
        active ? "bg-brass-500/15 text-brass-300" : "text-stone-500 hover:text-bone-100"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
