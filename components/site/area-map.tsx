"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site-config";
import { areas } from "@/lib/areas";

/**
 * Leaflet service-area map — plain Leaflet (no react-leaflet peer drama),
 * CARTO dark basemap to match the palette, 20-mile radius circle.
 * Loaded client-side only.
 */
export function AreaMap({ className }: { className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  useEffect(() => {
    if (!el.current || booted.current) return;
    booted.current = true;

    let map: import("leaflet").Map | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!el.current) return;

      map = L.map(el.current, {
        center: [site.base.lat, site.base.lng],
        zoom: 10,
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: true,
      });

      // Single host, no subdomain sharding — HTTP/2 makes it pointless and
      // some strict networks only allowlist the apex host.
      L.tileLayer("https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // leaflet.css injects after globals — win the background by inline style
      el.current.style.background = "#151a14";

      // 20-mile radius
      L.circle([site.base.lat, site.base.lng], {
        radius: site.radiusMiles * 1609.34,
        color: "#b08a49",
        weight: 1.5,
        opacity: 0.9,
        fillColor: "#b08a49",
        fillOpacity: 0.06,
      }).addTo(map);

      type Align = "top" | "bottom" | "left" | "right";
      const dot = (label: string, base = false, align: Align = "bottom") => {
        const text = `<div style="font:600 10px/1 'Inter Tight Variable',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:${base ? "#d3b078" : "#ede6d6"};text-shadow:0 1px 4px rgba(0,0,0,0.95);white-space:nowrap;">${label}</div>`;
        const mark = `<div style="width:${base ? 12 : 8}px;height:${base ? 12 : 8}px;border-radius:50%;background:${base ? "#c39d5f" : "#ede6d6"};border:2px solid ${base ? "#ede6d6" : "rgba(237,230,214,0.35)"};box-shadow:0 0 10px rgba(0,0,0,0.6);flex-shrink:0;"></div>`;
        const layouts: Record<Align, string> = {
          bottom: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;transform:translateY(-4px);">${mark}${text}</div>`,
          top: `<div style="display:flex;flex-direction:column-reverse;align-items:center;gap:4px;transform:translateY(4px);">${mark}${text}</div>`,
          right: `<div style="display:flex;align-items:center;gap:6px;">${mark}${text}</div>`,
          left: `<div style="display:flex;flex-direction:row-reverse;align-items:center;gap:6px;transform:translateX(-100%);margin-left:4px;">${mark}${text}</div>`,
        };
        return L.divIcon({ className: "", html: layouts[align], iconSize: [0, 0] });
      };

      L.marker([site.base.lat, site.base.lng], {
        icon: dot("Watford — base", true, "left"),
        keyboard: false,
      }).addTo(map);

      const towns: Record<string, { pos: [number, number]; align: Align }> = {
        "st-albans": { pos: [51.752, -0.336], align: "right" },
        "hemel-hempstead": { pos: [51.7526, -0.4692], align: "left" },
        harrow: { pos: [51.5806, -0.3417], align: "bottom" },
        bushey: { pos: [51.6429, -0.3604], align: "right" },
        radlett: { pos: [51.685, -0.318], align: "right" },
      };
      for (const a of areas) {
        const t = towns[a.slug];
        if (t) L.marker(t.pos, { icon: dot(a.name, false, t.align), keyboard: false }).addTo(map);
      }

      map.fitBounds(
        L.latLng(site.base.lat, site.base.lng).toBounds(site.radiusMiles * 1609.34 * 2.15)
      );
    })();

    return () => {
      map?.remove();
      booted.current = false;
    };
  }, []);

  return (
    <div
      ref={el}
      className={className}
      role="img"
      aria-label={`Map showing the ${site.radiusMiles}-mile service radius around Watford`}
    />
  );
}
