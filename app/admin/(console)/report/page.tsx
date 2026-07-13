import { getAdminAccess } from "@/lib/admin-auth";
import { listLeads } from "@/lib/admin-data";
import { computeReport, type Bucket } from "@/lib/report";

export const dynamic = "force-dynamic";

function Bars({ buckets, total }: { buckets: Bucket[]; total: number }) {
  if (buckets.length === 0) {
    return <p className="text-[13px] text-stone-500">No leads yet.</p>;
  }
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {buckets.map((b) => (
        <div key={b.key} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-[12px] text-stone-400 truncate" title={b.label}>
            {b.label}
          </div>
          <div className="flex-1 h-5 rounded-[2px] bg-bone-100/[0.05] overflow-hidden">
            <div
              className="h-full bg-brass-500/70 rounded-[2px]"
              style={{ width: `${Math.round((b.count / max) * 100)}%` }}
            />
          </div>
          <div className="w-16 shrink-0 text-right text-[12px] tabular-nums text-bone-100">
            {b.count}
            {total > 0 && (
              <span className="text-stone-500"> · {Math.round((b.count / total) * 100)}%</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[3px] border rule bg-bone-100/[0.02] px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-1 font-display text-2xl text-bone-50 tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-stone-400">{sub}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[3px] border rule bg-bone-100/[0.02] p-5">
      <h2 className="text-[13px] font-semibold text-bone-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default async function ReportPage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const leads = await listLeads();
  const r = computeReport(leads);

  const conv = r.quotedToWon.rate;

  return (
    <div>
      <p className="microlabel microlabel-brass">Admin</p>
      <h1 className="font-display text-3xl text-bone-50 mb-1">Report</h1>
      <p className="text-[13px] text-stone-400 mb-6">
        Where the work comes from, and where it goes.
        {isDemo && <span className="text-brass-300"> Sample figures — connect the database to see real numbers.</span>}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Tile label="Leads · all time" value={String(r.total)} />
        <Tile label="This week" value={String(r.thisWeek)} sub="last 7 days" />
        <Tile
          label="In the 20-mile area"
          value={r.total > 0 ? `${Math.round((r.area.in / r.total) * 100)}%` : "—"}
          sub={`${r.area.in} in · ${r.area.out} out`}
        />
        <Tile
          label="Quote → win"
          value={conv === null ? "—" : `${conv}%`}
          sub={`${r.quotedToWon.won} won · ${r.quotedToWon.lost} lost`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Pipeline — leads by stage">
          <Bars buckets={r.byStatus} total={r.total} />
        </Card>
        <Card title="Where they come from — by source">
          <Bars buckets={r.bySource} total={r.total} />
        </Card>
        <Card title="What they want — by service">
          <Bars buckets={r.byService} total={r.total} />
        </Card>
        <Card title="Conversion">
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Reached a quote</span>
              <span className="text-bone-100 tabular-nums">{r.quotedToWon.quoted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Won</span>
              <span className="text-bone-100 tabular-nums">{r.quotedToWon.won}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Lost</span>
              <span className="text-bone-100 tabular-nums">{r.quotedToWon.lost}</span>
            </div>
            <div className="border-t rule pt-3 flex justify-between">
              <span className="text-stone-300">Win rate (of decided)</span>
              <span className="text-brass-300 tabular-nums font-semibold">
                {conv === null ? "—" : `${conv}%`}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
