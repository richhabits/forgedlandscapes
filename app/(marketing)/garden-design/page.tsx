import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { serviceBySlug } from "@/lib/services";

const s = serviceBySlug("garden-design")!;
export const metadata: Metadata = {
  title: s.title,
  description: s.metaDescription,
  alternates: { canonical: `/${s.slug}` },
};

export default function Page() {
  return <ServicePage slug="garden-design" />;
}
