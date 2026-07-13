import { z } from "zod";

export const projectTypeValues = [
  "patio_paving",
  "driveway",
  "decking_woodwork",
  "lawn_softscape",
  "full_redesign",
  "other",
] as const;

export const budgetValues = ["under_5k", "5k_15k", "15k_40k", "over_40k", "unsure"] as const;

export const timelineValues = ["asap", "1_3_months", "3_6_months", "exploring"] as const;

const postcode = z
  .string()
  .trim()
  .min(2)
  .max(10)
  .regex(/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*(\d[A-Za-z]{2})?$/, "Enter a UK postcode");

export const leadSchema = z.object({
  email: z.email("Enter a valid email").max(254),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  postcode,
  project_type: z.enum(projectTypeValues),
  budget_band: z.enum(budgetValues).default("unsure"),
  timeline: z.enum(timelineValues).default("exploring"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.enum(["assessor", "assessor_ai", "form", "radius_widget"]).default("form"),
  referred_by: z.string().trim().max(254).optional().or(z.literal("")),
  consent: z.literal(true, { error: "Please confirm you're happy for us to contact you" }),
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(60)
    .optional(),
  /** Honeypot — humans never fill this. */
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
  company: z.string().max(0).optional().or(z.literal("")),
});
