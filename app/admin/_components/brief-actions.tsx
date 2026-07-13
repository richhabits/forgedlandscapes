"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Marks a brief reviewed → projects.status='reviewed' and fires the existing
 * client confirmation email ("we've reviewed your brief"). Server-verified as
 * admin in /api/admin/project; this is just the trigger.
 */
export function BriefActions({
  projectId,
  status,
  isDemo,
}: {
  projectId: string;
  status: string;
  isDemo: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const reviewed = status === "reviewed";

  async function markReviewed() {
    if (isDemo) {
      setFlash("Demo mode — not saved.");
      return;
    }
    setBusy(true);
    setFlash(null);
    const res = await fetch("/api/admin/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action: "review" }),
    });
    setBusy(false);
    if (res.ok) {
      setFlash("Marked reviewed — client emailed.");
      router.refresh();
    } else {
      setFlash("Couldn't update — try again.");
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {reviewed ? (
        <span className="flex items-center gap-2 text-[13px] text-moss-400">
          <Check className="size-4" /> Reviewed
        </span>
      ) : (
        <Button size="sm" disabled={busy} onClick={markReviewed}>
          {busy ? "Saving…" : "Mark reviewed & notify client"}
        </Button>
      )}
      {flash && <span className="text-[12px] text-stone-400">{flash}</span>}
    </div>
  );
}
