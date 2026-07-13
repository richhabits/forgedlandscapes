import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-auth";
import { listLeads, getMetrics, listStaff, listUnreadThreads } from "@/lib/admin-data";
import { StatTiles } from "@/app/admin/_components/stat-tiles";
import { LeadInbox } from "@/app/admin/_components/lead-inbox";
import { timeAgo } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";

  const [leads, metrics, staff, unread] = await Promise.all([
    listLeads(),
    getMetrics(),
    listStaff(),
    listUnreadThreads(),
  ]);

  return (
    <div className="space-y-8">
      {unread.length > 0 && (
        <div className="border border-brass-600/50 bg-brass-500/[0.07] rounded-[2px] p-4">
          <p className="microlabel microlabel-brass flex items-center gap-2 mb-2">
            <MessageSquareText className="size-3.5" /> You have {unread.reduce((n, t) => n + t.count, 0)} new client message{unread.reduce((n, t) => n + t.count, 0) > 1 ? "s" : ""}
          </p>
          <ul className="space-y-1.5">
            {unread.map((t) => (
              <li key={t.project_id}>
                <Link href={`/admin/projects/${t.project_id}`} className="flex items-baseline justify-between gap-3 text-[13px] hover:bg-bone-100/[0.04] rounded-[2px] px-2 -mx-2 py-1 transition-colors">
                  <span className="text-bone-100 truncate">
                    <span className="text-brass-300">{t.client || "A client"}</span>
                    {t.project_title ? ` · ${t.project_title}` : ""} — “{t.latest}”
                  </span>
                  <span className="text-stone-500 text-[11px] shrink-0">{timeAgo(t.latest_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="microlabel microlabel-brass">This week</p>
        <h1 className="font-display text-3xl text-bone-50 mt-1.5 mb-5">The lead desk</h1>
        <StatTiles m={metrics} />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl text-bone-50">Inbox</h2>
          <span className="text-[12px] text-stone-500">{leads.length} total</span>
        </div>
        <LeadInbox leads={leads} staff={staff} isDemo={isDemo} />
      </div>
    </div>
  );
}
