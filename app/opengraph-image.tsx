import { ImageResponse } from "next/og";
import { site } from "@/lib/site-config";

/**
 * The social/rich-result card every page falls back to. On-brand: forge-950
 * ground, brass hairline + accent, bone editorial type. Generated at the edge
 * so it stays in step with the brand without shipping a static asset.
 */
export const alt = "Forged Landscapes — design & build landscaping, Watford & Hertfordshire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10140f",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* anvil mark + top rule + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="60" height="60" viewBox="0 0 40 40">
            <path d="M20 3 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 Z" fill="#b08a49" />
            <path d="M8 15 h24 v6 h-6 l-4 4 h-8 l-4 -4 h-2 Z" fill="#f4efe4" />
            <path d="M8 16 l-5 2.5 5 2.5 Z" fill="#f4efe4" />
            <path d="M17 25 h6 l-2 8 h-2 Z" fill="#f4efe4" />
            <path d="M12 33 h16 l3 5 h-22 Z" fill="#f4efe4" />
          </svg>
          <div style={{ width: 56, height: 2, background: "#b08a49" }} />
          <div
            style={{
              color: "#a89f8c",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Watford · Hertfordshire · 20-mile radius
          </div>
        </div>

        {/* wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#f4efe4", fontSize: 96, lineHeight: 1 }}>
            Forged&nbsp;<span style={{ color: "#d3b078", fontStyle: "italic" }}>Landscapes</span>
          </div>
          <div
            style={{
              color: "#cfc4ab",
              fontSize: 34,
              marginTop: 28,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Porcelain patios, block &amp; resin driveways, decking, lawns and full garden
            transformations — design and build, guaranteed.
          </div>
        </div>

        {/* bottom rule + domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(237,230,214,0.18)",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "#93713a", fontSize: 26, fontFamily: "Arial, sans-serif" }}>
            {site.domain}
          </div>
          <div
            style={{
              color: "#8a8272",
              fontSize: 22,
              fontFamily: "Arial, sans-serif",
            }}
          >
            5-year workmanship guarantee
          </div>
        </div>
      </div>
    ),
    size
  );
}
