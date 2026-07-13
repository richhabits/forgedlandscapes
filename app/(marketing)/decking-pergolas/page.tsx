import type { Metadata } from "next";
import { ServicePage } from "@/components/site/service-page";
import { serviceBySlug } from "@/lib/services";

const s = serviceBySlug("decking-pergolas")!;
export const metadata: Metadata = {
  title: s.title,
  description: s.metaDescription,
  alternates: { canonical: `/${s.slug}` },
};

export default function Page() {
  return <ServicePage slug="decking-pergolas" />;
}
