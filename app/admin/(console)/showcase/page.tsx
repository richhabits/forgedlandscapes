import { getAdminAccess } from "@/lib/admin-auth";
import { loadAllShowcase } from "@/lib/showcase";
import { ShowcaseEditor } from "@/app/admin/_components/showcase-editor";

export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const items = await loadAllShowcase();

  return (
    <div>
      <p className="microlabel microlabel-brass">Marketing</p>
      <h1 className="font-display text-3xl text-bone-50 mb-6">Before &amp; after gallery</h1>
      <ShowcaseEditor items={items} isDemo={isDemo} />
    </div>
  );
}
