"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Msg = {
  id: string;
  sender_role: "client" | "team";
  author_name: string | null;
  body: string;
  created_at: string;
};

/**
 * Client ↔ team conversation in the portal. Reads and writes project_messages
 * directly through RLS (the client owns their project), so no API route needed.
 * Renders nothing until the client has a project to talk about.
 */
export function ProjectMessages({ client, user }: { client: SupabaseClient; user: User }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (pid: string) => {
      const { data } = await client
        .from("project_messages")
        .select("id,sender_role,author_name,body,created_at")
        .eq("project_id", pid)
        .order("created_at", { ascending: true });
      setMessages((data as Msg[] | null) ?? []);
    },
    [client]
  );

  useEffect(() => {
    (async () => {
      const { data } = await client
        .from("projects")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) {
        setProjectId(data.id);
        await loadMessages(data.id);
      }
      setReady(true);
    })();
  }, [client, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  async function send() {
    if (!body.trim() || !projectId) return;
    setBusy(true);
    const text = body.trim();
    const { error } = await client.from("project_messages").insert({
      project_id: projectId,
      sender_role: "client",
      author_name: user.email?.split("@")[0] || "Client",
      body: text,
    });
    setBusy(false);
    if (!error) {
      setBody("");
      await loadMessages(projectId);
    }
  }

  // Nothing to show until they've started a project.
  if (!ready || !projectId) return null;

  return (
    <section className="mb-10 max-w-2xl">
      <p className="microlabel microlabel-brass">Your team</p>
      <h2 className="font-display text-2xl text-bone-50 mt-1.5 mb-4">Messages</h2>
      <div className="border rule rounded-[2px] bg-forge-900">
        <div className="max-h-80 overflow-y-auto thin-scroll p-4 space-y-2.5 flex flex-col">
          {messages.length === 0 ? (
            <p className="text-stone-500 text-[13px] text-center py-6">
              Questions about your project? Message us here — we'll reply in the portal and by email.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "text-[13.5px] leading-relaxed px-3 py-2 rounded-[2px] max-w-[85%]",
                  m.sender_role === "client"
                    ? "bg-brass-500/10 border border-brass-600/30 text-bone-100 ml-auto"
                    : "bg-bone-100/[0.04] border rule text-stone-300"
                )}
              >
                <span className="microlabel !text-[9px] block mb-0.5">
                  {m.sender_role === "client" ? "You" : m.author_name || "Forged Landscapes"}
                </span>
                {m.body}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t rule p-3 flex gap-2">
          <input
            className="field flex-1"
            placeholder="Message your team…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          />
          <Button size="md" disabled={busy || !body.trim()} onClick={send} aria-label="Send">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
