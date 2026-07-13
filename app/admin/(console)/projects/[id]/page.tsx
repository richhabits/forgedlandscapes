import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-auth";
import { getProjectDetail, getProjectMessages } from "@/lib/admin-data";
import { ProjectThread } from "@/app/admin/_components/project-thread";
import { QuoteDrafter } from "@/app/admin/_components/quote-drafter";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  BUDGET_LABELS,
  TIMELINE_LABELS,
  label,
  timeAgo,
} from "@/lib/labels";
import { MediaGallery } from "@/app/admin/_components/media-gallery";
import { BriefActions } from "@/app/admin/_components/brief-actions";

export const dynamic = "force-dynamic";

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAdminAccess();
  const isDemo = access.ok && access.gate.mode === "demo";

  const [p, messages] = await Promise.all([getProjectDetail(id), getProjectMessages(id)]);
  if (!p) notFound();

  const photos = p.media.filter((m) => m.kind === "garden_photo" || m.kind === "garden_video");
  const sketches = p.media.filter((m) => m.kind === "sketch_canvas" || m.kind === "sketch_upload");
  const inspo = p.media.filter((m) => m.kind === "inspiration");

  return (
    <div className="max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[12px] text-stone-500 hover:text-bone-100 transition-colors mb-6">
        <ArrowLeft className="size-4" /> Back to inbox
      </Link>

      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="microlabel microlabel-brass">Brief · {label(PROJECT_STATUS_LABELS, p.status)}</p>
          <h1 className="font-display text-3xl text-bone-50 mt-1.5">
            {p.title || label(PROJECT_TYPE_LABELS, p.project_type)}
          </h1>
          <p className="text-[13px] text-stone-500 mt-1">
            {p.clientEmail ? (
              <a href={`mailto:${p.clientEmail}`} className="text-brass-300 underline underline-offset-2">{p.clientEmail}</a>
            ) : "Client email unknown"}
            {" · "}
            {p.submitted_at ? `submitted ${timeAgo(p.submitted_at)}` : `started ${timeAgo(p.created_at)}`}
          </p>
        </div>
        <BriefActions projectId={p.id} status={p.status} isDemo={isDemo} />
      </div>

      {/* survey-prep meta */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bone-100/10 border rule rounded-[2px] overflow-hidden mb-8">
        <Meta k="Working area" v={p.area_m2 ? `${p.area_m2} m²` : "TBC at survey"} sub={p.length_m && p.width_m ? `${p.length_m}m × ${p.width_m}m` : undefined} />
        <Meta k="Project" v={label(PROJECT_TYPE_LABELS, p.project_type)} />
        <Meta k="Budget" v={label(BUDGET_LABELS, p.budget_band)} />
        <Meta k="Timeline" v={label(TIMELINE_LABELS, p.timeline)} />
      </dl>

      {/* rough estimate */}
      <Section title="Estimate">
        <QuoteDrafter projectId={p.id} isDemo={isDemo} />
      </Section>

      {/* conversation with the client */}
      <Section title="Messages with the client">
        <ProjectThread projectId={p.id} initialMessages={messages} clientName={p.clientEmail} isDemo={isDemo} />
      </Section>

      {/* description */}
      <Section title="The brief">
        <p className="text-[14.5px] text-bone-100/90 leading-relaxed whitespace-pre-wrap">
          {p.description || "No description provided."}
        </p>
        {(p.postcode || p.second_space || p.access_notes) && (
          <dl className="mt-5 divide-y divide-bone-100/8 border-y rule text-[13px]">
            {p.postcode && <MetaRow k="Postcode" v={p.postcode} />}
            {p.second_space && <MetaRow k="Second space" v={p.second_space} />}
            {p.access_notes && <MetaRow k="Access notes" v={p.access_notes} />}
          </dl>
        )}
      </Section>

      {/* photos & video */}
      <Section title={`Photos & video (${photos.length})`}>
        <MediaGallery media={photos} title="Photos" />
      </Section>

      {/* sketches */}
      {sketches.length > 0 && (
        <Section title={`Layout sketches (${sketches.length})`}>
          <MediaGallery media={sketches} title="Sketches" />
        </Section>
      )}

      {/* inspiration */}
      <Section title={`Inspiration (${p.inspirationLinks.length} links, ${inspo.length} images)`}>
        {p.inspirationLinks.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {p.inspirationLinks.map((l) => (
              <li key={l}>
                <a
                  href={l}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-2.5 text-[13px] text-stone-300 border rule px-3 py-2 hover:border-bone-100/35 transition-colors"
                >
                  <ExternalLink className="size-3.5 text-brass-400 shrink-0" />
                  <span className="truncate flex-1">{l}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {inspo.length > 0 && <MediaGallery media={inspo} title="Inspiration" />}
        {p.inspirationLinks.length === 0 && inspo.length === 0 && (
          <p className="text-[13px] text-stone-500">None provided.</p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="microlabel mb-3">{title}</p>
      {children}
    </section>
  );
}

function Meta({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-forge-900 px-4 py-4">
      <p className="microlabel">{k}</p>
      <p className="font-display text-xl text-bone-50 mt-1.5 leading-none">{v}</p>
      {sub && <p className="text-[11px] text-stone-500 mt-1.5">{sub}</p>}
    </div>
  );
}

function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="py-2.5 grid grid-cols-3 gap-3">
      <dt className="microlabel !normal-case !tracking-normal !text-[11.5px] !text-stone-500">{k}</dt>
      <dd className="col-span-2 text-bone-100/90 leading-relaxed">{v}</dd>
    </div>
  );
}
