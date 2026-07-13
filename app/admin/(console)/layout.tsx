import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";
import { SignOutButton } from "@/app/admin/_components/sign-out-button";

/**
 * The gated console shell. Router-layer half of the two-layer gate: a
 * signed-out or non-admin user is redirected here BEFORE any data renders.
 * RLS (is_admin policies) independently guarantees the data layer returns
 * nothing to a non-admin even if this check were bypassed.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();
  if (!access.ok) redirect("/admin/login");

  const isDemo = access.gate.mode === "demo";
  const email = access.gate.mode === "live" ? access.gate.email : "";

  return (
    <div className="min-h-dvh grain">
      <header className="sticky top-0 z-20 border-b rule bg-forge-950/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="font-display text-[17px] text-bone-50 leading-none">
              Forged <span className="display-italic text-brass-300">Admin</span>
            </Link>
            <nav className="flex items-center gap-1 text-[12px]">
              <Link href="/admin" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Inbox</Link>
              <Link href="/admin/team" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Team</Link>
              <Link href="/admin/partners" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Partners</Link>
              <Link href="/admin/rates" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Rates</Link>
              <Link href="/admin/showcase" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Gallery</Link>
              <Link href="/admin/settings" className="px-2.5 py-1.5 rounded-[2px] text-stone-400 hover:text-bone-100 hover:bg-bone-100/[0.05] transition-colors">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isDemo ? (
              <span className="microlabel microlabel-brass">Demo mode</span>
            ) : (
              <SignOutButton email={email} />
            )}
          </div>
        </div>
      </header>

      {isDemo && (
        <div className="border-b border-brass-600/40 bg-brass-500/[0.06] px-5 md:px-8 py-2.5">
          <p className="mx-auto max-w-7xl text-[12px] text-brass-300">
            Demo mode — sample data, no database connected. Attach Supabase and seed an admin to go live.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 md:px-8 py-8">{children}</main>
    </div>
  );
}
