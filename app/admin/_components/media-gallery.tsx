"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaView } from "@/lib/admin-data";
import { MEDIA_KIND_LABELS } from "@/lib/labels";

const isVideo = (m: MediaView) => m.kind === "garden_video";
const src = (m: MediaView) => m.signedUrl || m.externalUrl || "";

export function MediaGallery({ media, title }: { media: MediaView[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  if (media.length === 0) {
    return <p className="text-[13px] text-stone-500">No files attached.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setOpen(i)}
            className="group relative aspect-4/3 overflow-hidden rounded-[2px] border rule bg-forge-950 cursor-pointer"
          >
            {src(m) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src(m)}
                alt={m.caption || MEDIA_KIND_LABELS[m.kind] || "media"}
                className={cn(
                  "size-full object-cover transition-transform duration-500 group-hover:scale-105",
                  m.kind.startsWith("sketch") ? "object-contain bg-bone-50" : "img-grade"
                )}
                loading="lazy"
              />
            ) : (
              <div className="size-full grid place-items-center text-stone-600 text-xs">No preview</div>
            )}
            {isVideo(m) && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="size-10 rounded-full bg-forge-950/70 grid place-items-center">
                  <Play className="size-5 text-bone-50" />
                </span>
              </span>
            )}
            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-forge-950/90 to-transparent px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.1em] text-bone-200">
                {MEDIA_KIND_LABELS[m.kind] ?? m.kind}
              </span>
            </span>
          </button>
        ))}
      </div>

      {open !== null && media[open] && (
        <Lightbox
          items={media}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: MediaView[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const m = items[index];
  const go = (d: number) => onIndex((index + d + items.length) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-[60] bg-forge-950/95 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[12px] text-stone-400">
          {m.caption || MEDIA_KIND_LABELS[m.kind]} · {index + 1}/{items.length}
        </span>
        <button onClick={onClose} className="text-stone-400 hover:text-bone-100 cursor-pointer" aria-label="Close">
          <X className="size-6" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
        {items.length > 1 && (
          <button onClick={() => go(-1)} className="shrink-0 text-stone-400 hover:text-bone-100 cursor-pointer p-2" aria-label="Previous">
            <ChevronLeft className="size-8" />
          </button>
        )}
        <div className="flex-1 h-full flex items-center justify-center min-w-0">
          {isVideo(m) ? (
            <video src={src(m)} controls autoPlay className="max-h-full max-w-full rounded-[2px]" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src(m)} alt={m.caption || "media"} className="max-h-full max-w-full object-contain rounded-[2px]" />
          )}
        </div>
        {items.length > 1 && (
          <button onClick={() => go(1)} className="shrink-0 text-stone-400 hover:text-bone-100 cursor-pointer p-2" aria-label="Next">
            <ChevronRight className="size-8" />
          </button>
        )}
      </div>
    </div>
  );
}
