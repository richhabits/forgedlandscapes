"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/lib/images";

/**
 * House image component: next/image + the house grade + an art-directed
 * fallback if a remote comp ever 404s (never a broken-image icon).
 */
export function SiteImg({
  image,
  className,
  imgClassName,
  sizes = "100vw",
  priority = false,
  fill = true,
  width,
  height,
}: {
  image: SiteImage;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={image.alt}
        role="img"
        className={cn(
          "relative overflow-hidden bg-forge-800",
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,154,120,0.25),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(176,138,73,0.12),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="microlabel">{image.alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={cn("object-cover img-grade", imgClassName)}
      />
    </div>
  );
}
