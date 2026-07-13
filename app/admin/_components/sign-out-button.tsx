"use client";

import { useRouter } from "next/navigation";
import { getAdminBrowserSupabase } from "@/lib/supabase-browser";

export function SignOutButton({ email }: { email: string }) {
  const router = useRouter();
  return (
    <button
      className="text-[12px] text-stone-500 hover:text-bone-100 transition-colors cursor-pointer underline-offset-4 hover:underline"
      onClick={async () => {
        await getAdminBrowserSupabase()?.auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out{email ? ` (${email})` : ""}
    </button>
  );
}
