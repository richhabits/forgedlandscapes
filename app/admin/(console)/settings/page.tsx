import { getAdminAccess } from "@/lib/admin-auth";
import { listSettings, countSampleData } from "@/lib/admin-data";
import { SettingsManager } from "@/app/admin/_components/settings-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const [settings, sampleCount] = await Promise.all([listSettings(), countSampleData()]);

  return (
    <div>
      <p className="microlabel microlabel-brass">Admin</p>
      <h1 className="font-display text-3xl text-bone-50 mb-6">Settings</h1>
      <SettingsManager settings={settings} sampleCount={sampleCount} isDemo={isDemo} />
    </div>
  );
}
