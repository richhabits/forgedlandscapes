import { getAdminAccess } from "@/lib/admin-auth";
import { listLeads, getMetrics } from "@/lib/admin-data";
import { StatTiles } from "@/app/admin/_components/stat-tiles";
import { LeadInbox } from "@/app/admin/_components/lead-inbox";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";

  const [leads, metrics] = await Promise.all([listLeads(), getMetrics()]);

  return (
    <div className="space-y-8">
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
        <LeadInbox leads={leads} isDemo={isDemo} />
      </div>
    </div>
  );
}
