import { getAdminAccess } from "@/lib/admin-auth";
import { loadRates } from "@/lib/rates";
import { RatesEditor } from "@/app/admin/_components/rates-editor";

export const dynamic = "force-dynamic";

export default async function RatesPage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const rates = await loadRates();

  return (
    <div>
      <p className="microlabel microlabel-brass">The estimator</p>
      <h1 className="font-display text-3xl text-bone-50 mb-6">Your rates</h1>
      <RatesEditor rates={rates} isDemo={isDemo} />
    </div>
  );
}
