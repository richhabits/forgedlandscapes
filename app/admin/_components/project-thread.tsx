"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectMessage } from "@/lib/admin-data";
import { timeAgo } from "@/lib/labels";
import { newVideoRoom } from "@/lib/call";
import { Button } from "@/components/ui/button";

/** Admin side of the client conversation — reads the thread and replies as the team. */
export function ProjectThread({
  projectId,
  initialMessages,
  clientName,
  isDemo,
}: {
  projectId: string;
  initialMessages: ProjectMessage[];
  clientName: string | null;
  isDemo: boolean;
}) {
  const router = useRouter();
  // Render from the prop so a router.refresh() after sending shows the new reply.
  const messages = initialMessages;
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  // Mark the client's messages read on open.
  useEffect(() => {
    if (isDemo) return;
    if (initialMessages.some((m) => m.sender_role === "client")) {
      fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "read", project_id: projectId }),
      }).then(() => router.refresh());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postBody(text: string) {
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "project", project_id: projectId, body: text }),
    });
    return res.ok;
  }

  async function send() {
    if (!body.trim()) return;
    if (isDemo) {
      setBody("");
      return;
    }
    setBusy(true);
    const ok = await postBody(body.trim());
    setBusy(false);
    if (ok) {
      setBody("");
      router.refresh();
    }
  }

  async function startCall() {
    const url = newVideoRoom();
    window.open(url, "_blank", "noopener");
    if (isDemo) return;
    setBusy(true);
    const ok = await postBody(`📹 I've started a video call — join here (no app needed): ${url}`);
    setBusy(false);
    if (ok) router.refresh();
  }

  return (
    <div className="border rule rounded-[2px] bg-forge-900">
      <div className="max-h-96 overflow-y-auto thin-scroll p-4 space-y-2.5 flex flex-col">
        {messages.length === 0 ? (
          <p className="text-stone-500 text-[13px] text-center py-6">
            No messages yet. Send {clientName ? clientName.split(" ")[0] : "the client"} a note to open the conversation.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "text-[13.5px] leading-relaxed px-3 py-2 rounded-[2px] max-w-[85%]",
                m.sender_role === "team"
                  ? "bg-brass-500/10 border border-brass-600/30 text-bone-100 ml-auto"
                  : "bg-bone-100/[0.04] border rule text-stone-300"
              )}
            >
              <span className="microlabel !text-[9px] block mb-0.5">
                {m.sender_role === "team" ? "You" : m.author_name || clientName || "Client"} · {timeAgo(m.created_at)}
              </span>
              {m.body}
            </div>
          ))
        )}
      </div>
      <div className="border-t rule p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="field flex-1"
            placeholder={`Reply to ${clientName ? clientName.split(" ")[0] : "the client"}…`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          />
          <Button size="md" disabled={busy || !body.trim()} onClick={send} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </div>
        <button
          onClick={startCall}
          disabled={busy}
          className="flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-brass-300 transition-colors cursor-pointer"
        >
          <Video className="size-3.5" /> Start a video call (free, sends the client a join link)
        </button>
      </div>
    </div>
  );
}
