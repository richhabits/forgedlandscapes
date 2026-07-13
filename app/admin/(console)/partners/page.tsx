import { getAdminAccess } from "@/lib/admin-auth";
import { listPartners } from "@/lib/admin-data";
import { PartnersBoard } from "@/app/admin/_components/partners-board";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const partners = await listPartners();

  return (
    <div>
      <p className="microlabel microlabel-brass">Directory</p>
      <h1 className="font-display text-3xl text-bone-50 mb-6">Partners & suppliers</h1>
      <PartnersBoard partners={partners} isDemo={isDemo} />
    </div>
  );
}
