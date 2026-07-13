import { NextResponse } from "next/server";
import { generateText, tool, stepCountIs } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { SYSTEM_PROMPT } from "@/lib/assessor";
import { checkServiceArea } from "@/lib/geo";
import { chatRequestSchema, projectTypeValues, budgetValues, timelineValues } from "@/lib/validation";
import { getServerSupabase } from "@/lib/supabase";
import { sendAdminLeadAlert } from "@/lib/email";
import { hit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * THE NEEDS ASSESSOR — AI mode.
 * Groq (free tier) via Vercel AI SDK, with tool-verified postcode checks —
 * the model never does distance maths itself.
 *
 * GET  → health: which mode the widget should run ("ai" | "scripted").
 * POST → one conversational turn (JSON, non-streaming — answers are short,
 *        and a simple response shape keeps the fallback path identical).
 */

export async function GET() {
  return NextResponse.json({
    mode: process.env.GROQ_API_KEY ? "ai" : "scripted",
  });
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI mode unavailable", fallback: true },
      { status: 503 }
    );
  }

  const limited = await hit(`chat:${clientIp(req)}`, { max: 30, windowMs: 10 * 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Slow down a touch", retryAfter: limited.retryAfterSeconds },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let portalUrl: string | undefined;
  let leadSaved = false;

  const groq = createGroq({ apiKey });
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const result = await generateText({
      model: groq(model),
      system: SYSTEM_PROMPT,
      messages: parsed.data.messages,
      stopWhen: stepCountIs(4),
      temperature: 0.4,
      tools: {
        check_postcode: tool({
          description:
            "Verify whether a UK postcode falls within the 20-mile Watford service radius. ALWAYS call this when the user provides a postcode.",
          inputSchema: z.object({
            postcode: z.string().describe("UK postcode, full or outward code"),
          }),
          execute: async ({ postcode }) => {
            const r = await checkServiceArea(postcode);
            return r;
          },
        }),
        save_lead: tool({
          description:
            "Persist the qualified lead once the user has provided their email. Call exactly once, after email capture.",
          inputSchema: z.object({
            email: z.string().describe("The user's email address"),
            name: z.string().optional().describe("First name if volunteered"),
            postcode: z.string(),
            project_type: z.enum(projectTypeValues),
            budget_band: z.enum(budgetValues),
            timeline: z.enum(timelineValues),
            in_area: z.boolean(),
            distance_miles: z.number().optional(),
          }),
          execute: async (lead) => {
            const transcript = parsed.data.messages.slice(-40);
            const supabase = getServerSupabase();
            if (supabase) {
              const { error } = await supabase.from("leads").insert({
                email: lead.email.toLowerCase().trim(),
                name: lead.name || null,
                postcode: lead.postcode.toUpperCase(),
                project_type: lead.project_type,
                budget_band: lead.budget_band,
                timeline: lead.timeline,
                in_area: lead.in_area,
                distance_miles: lead.distance_miles ?? null,
                source: "assessor_ai",
                status: lead.in_area ? "new" : "out_of_area",
                transcript,
              });
              if (error) return { saved: false, error: "storage failed" };
            }
            leadSaved = true;
            if (lead.in_area) {
              portalUrl = `/portal?email=${encodeURIComponent(lead.email)}`;
            }
            // fire-and-forget admin alert
            sendAdminLeadAlert({
              email: lead.email,
              name: lead.name,
              phone: null,
              postcode: lead.postcode,
              project_type: lead.project_type,
              budget_band: lead.budget_band,
              timeline: lead.timeline,
              in_area: lead.in_area,
              distance_miles: lead.distance_miles ?? null,
              source: "assessor_ai",
            }).catch(() => {});
            return { saved: true, portalUrl: portalUrl ?? null };
          },
        }),
      },
    });

    const text =
      result.text?.trim() ||
      "Noted. Could you give me that once more?";

    return NextResponse.json({ message: text, portalUrl, leadSaved });
  } catch (e) {
    console.error("[chat] model error", e);
    return NextResponse.json(
      { error: "model error", fallback: true },
      { status: 502 }
    );
  }
}
