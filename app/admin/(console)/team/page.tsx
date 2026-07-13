import { getAdminAccess } from "@/lib/admin-auth";
import { listStaff, listTeamMessages } from "@/lib/admin-data";
import { TeamBoard } from "@/app/admin/_components/team-board";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";
  const [staff, messages] = await Promise.all([listStaff(), listTeamMessages()]);

  return (
    <div className="space-y-2">
      <p className="microlabel microlabel-brass">The team</p>
      <h1 className="font-display text-3xl text-bone-50 mb-6">Staff & status</h1>
      <TeamBoard staff={staff} messages={messages} isDemo={isDemo} />
    </div>
  );
}
