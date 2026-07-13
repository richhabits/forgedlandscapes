import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Service area" };

/** Kept as a stable URL (footer/legal links) — canonical content lives at /areas. */
export default function ServiceAreaPage() {
  redirect("/areas");
}
