"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * SuDS compliance checker — the "5m² rule" made tangible.
 * GPDO 2015, Sch.2 Part 1 Class F: hard surface >5m² between the principal
 * elevation and the highway must be permeable, or drain to a permeable
 * area, to remain permitted development.
 */

type Surface = "permeable" | "impermeable";
type Drains = "highway" | "garden";

export function SudsCalculator() {
  const [w, setW] = useState("6");
  const [d, setD] = useState("5");
  const [surface, setSurface] = useState<Surface>("impermeable");
  const [drains, setDrains] = useState<Drains>("highway");

  const area = useMemo(() => {
    const width = parseFloat(w);
    const depth = parseFloat(d);
    if (!isFinite(width) || !isFinite(depth) || width <= 0 || depth <= 0) return null;
    return Math.round(width * depth * 10) / 10;
  }, [w, d]);

  const verdict = useMemo(() => {
    if (area == null) return null;
    if (area <= 5)
      return {
        ok: true,
        title: "Permitted development — under 5m²",
        body: "At this size the surface type doesn't trigger the planning rules, though we'd still design drainage properly.",
      };
    if (surface === "permeable")
      return {
        ok: true,
        title: "Permitted development — permeable surface",
        body: "Permeable block, resin-bound over an open-grade base, or gravel lets rain drain through — no planning application needed at any size.",
      };
    if (drains === "garden")
      return {
        ok: true,
        title: "Permitted development — drains to a permeable area",
        body: "An impermeable surface is fine when run-off is directed to a lawn, border or soakaway within your boundary. We size the soakaway to the area.",
      };
    return {
      ok: false,
      title: "Planning permission required",
      body: `${area}m² of impermeable surface draining towards the highway exceeds the 5m² allowance. We'd redesign this permeable — usually at similar cost — or handle the planning application for you.`,
    };
  }, [area, surface, drains]);

  const seg = (active: boolean) =>
    cn(
      "flex-1 px-3 py-2.5 text-[12px] font-medium tracking-[0.04em] border rounded-[2px] transition-colors cursor-pointer text-center",
      active
        ? "border-brass-400 bg-brass-500/10 text-brass-300"
        : "border-bone-100/15 text-stone-400 hover:border-bone-100/30"
    );

  return (
    <div className="border rule bg-forge-900 p-6 md:p-8">
      <p className="microlabel microlabel-brass">Interactive — SuDS &amp; the 5m² rule</p>
      <h3 className="font-display text-2xl text-bone-50 mt-3">
        Will your new driveway need planning permission?
      </h3>
      <p className="text-sm text-stone-400 mt-2 leading-relaxed">
        Since 2008, front-garden surfaces over 5m² must be permeable — or drain
        to a permeable area — to stay within permitted development.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="microlabel">Width (m)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.5"
            max="50"
            step="0.5"
            value={w}
            onChange={(e) => setW(e.target.value)}
            className="field mt-2"
            aria-label="Driveway width in metres"
          />
        </label>
        <label className="block">
          <span className="microlabel">Depth (m)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.5"
            max="50"
            step="0.5"
            value={d}
            onChange={(e) => setD(e.target.value)}
            className="field mt-2"
            aria-label="Driveway depth in metres"
          />
        </label>
      </div>

      <div className="mt-5">
        <span className="microlabel">Surface</span>
        <div className="flex gap-2 mt-2" role="radiogroup" aria-label="Surface type">
          <button className={seg(surface === "impermeable")} onClick={() => setSurface("impermeable")} role="radio" aria-checked={surface === "impermeable"}>
            Impermeable (sealed concrete, standard block on mortar)
          </button>
          <button className={seg(surface === "permeable")} onClick={() => setSurface("permeable")} role="radio" aria-checked={surface === "permeable"}>
            Permeable (resin-bound, permeable block, gravel)
          </button>
        </div>
      </div>

      {surface === "impermeable" && (
        <div className="mt-5">
          <span className="microlabel">Where does rain run off to?</span>
          <div className="flex gap-2 mt-2" role="radiogroup" aria-label="Run-off destination">
            <button className={seg(drains === "highway")} onClick={() => setDrains("highway")} role="radio" aria-checked={drains === "highway"}>
              Towards the road / drain
            </button>
            <button className={seg(drains === "garden")} onClick={() => setDrains("garden")} role="radio" aria-checked={drains === "garden"}>
              Lawn, border or soakaway
            </button>
          </div>
        </div>
      )}

      {verdict && (
        <div
          role="status"
          className={cn(
            "mt-6 border p-5",
            verdict.ok
              ? "border-moss-600/60 bg-moss-600/10"
              : "border-danger/50 bg-danger/10"
          )}
        >
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <p className={cn("font-semibold text-[15px]", verdict.ok ? "text-moss-400" : "text-danger")}>
              {verdict.title}
            </p>
            {area != null && (
              <p className="microlabel">{area} m² total</p>
            )}
          </div>
          <p className="text-sm text-stone-400 mt-2 leading-relaxed">{verdict.body}</p>
        </div>
      )}

      <p className="text-[11px] text-stone-600 mt-4">
        Guidance, not legal advice — confirmed against your borough's policy at survey. Every Forged driveway is designed SuDS-compliant as standard.
      </p>
    </div>
  );
}
