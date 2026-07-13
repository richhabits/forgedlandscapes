"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CloudUpload, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/portal-types";

const MAX_FILES = 12;
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

/**
 * Drag-and-drop media uploader. The actual persistence is delegated via
 * `upload` (Supabase storage in real mode, object URLs in preview mode),
 * so the component stays pure UI.
 */
export function Uploader({
  items,
  kind,
  accept = "image/*,video/mp4,video/quicktime,video/webm",
  allowVideo = true,
  upload,
  remove,
  label,
}: {
  items: MediaItem[];
  kind: MediaItem["kind"];
  accept?: string;
  allowVideo?: boolean;
  upload: (file: File, kind: MediaItem["kind"]) => Promise<void>;
  remove: (item: MediaItem) => void | Promise<void>;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const files = Array.from(list);
    if (items.length + files.length > MAX_FILES) {
      setError(`Up to ${MAX_FILES} files per brief — plenty for a survey.`);
      return;
    }
    setBusy(true);
    for (const f of files) {
      const isVideo = f.type.startsWith("video/");
      if (isVideo && !allowVideo) continue;
      const limit = (isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024;
      if (f.size > limit) {
        setError(`${f.name} is over ${isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB}MB — a phone-quality version is fine.`);
        continue;
      }
      if (!f.type.startsWith("image/") && !isVideo) continue;
      try {
        await upload(f, isVideo ? "garden_video" : kind);
      } catch {
        setError(`Couldn't upload ${f.name} — try again.`);
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "w-full border border-dashed rounded-[2px] p-8 text-center transition-colors cursor-pointer",
          over
            ? "border-brass-400 bg-brass-500/10"
            : "border-bone-100/20 hover:border-bone-100/40 bg-bone-100/[0.02]"
        )}
        aria-label={label}
      >
        <CloudUpload className="size-6 mx-auto text-brass-400" aria-hidden />
        <p className="mt-3 text-[14px] text-bone-100">{busy ? "Uploading…" : label}</p>
        <p className="mt-1 text-[12px] text-stone-500">
          Drag &amp; drop or tap — photos up to {MAX_IMAGE_MB}MB{allowVideo ? `, video up to ${MAX_VIDEO_MB}MB` : ""}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="mt-3 text-[12.5px] text-danger" role="alert">{error}</p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {items.map((m) => (
            <li key={m.id} className="relative group aspect-square border rule overflow-hidden bg-forge-850">
              {m.kind === "garden_video" ? (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-stone-400">
                  <Film className="size-5" aria-hidden />
                  <span className="text-[10px] px-2 text-center truncate w-full">{m.name}</span>
                </span>
              ) : m.url ? (
                <Image src={m.url} alt={m.name || "Uploaded image"} fill sizes="120px" className="object-cover" unoptimized />
              ) : null}
              <button
                type="button"
                onClick={() => remove(m)}
                className="absolute top-1 right-1 size-6 rounded-full bg-forge-950/90 border rule flex items-center justify-center text-stone-400 hover:text-danger transition-colors cursor-pointer"
                aria-label={`Remove ${m.name || "file"}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
