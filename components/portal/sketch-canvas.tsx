"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Pen, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hand-rolled sketch canvas — zones, arrows, scribbles ("patio here, lawn there").
 * Stroke-stack model so undo re-renders cleanly; exports PNG via toBlob.
 * ~150 lines, zero dependencies, styled to the house.
 */

type Stroke = {
  color: string;
  width: number;
  erase: boolean;
  points: { x: number; y: number }[];
};

const W = 1200;
const H = 900;

export function SketchCanvas({
  onExport,
  disabled = false,
}: {
  onExport: (blob: Blob) => void | Promise<void>;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<"brass" | "bone" | "erase">("brass");
  const [dirty, setDirty] = useState(false);
  const [exporting, setExporting] = useState(false);

  const colorFor = (t: typeof tool) =>
    t === "brass" ? "#c39d5f" : t === "bone" ? "#ede6d6" : "#1a2019";

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // paper
    ctx.fillStyle = "#1a2019";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(237,230,214,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // strokes
    for (const s of [...strokes.current, ...(current.current ? [current.current] : [])]) {
      if (s.points.length < 2) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i];
        const prev = s.points[i - 1];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
      }
      ctx.stroke();
    }
  }

  useEffect(() => {
    redraw();
  }, []);

  function pos(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }

  function down(e: React.PointerEvent) {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    current.current = {
      color: colorFor(tool),
      width: tool === "erase" ? 34 : 5,
      erase: tool === "erase",
      points: [pos(e)],
    };
  }

  function move(e: React.PointerEvent) {
    if (!current.current) return;
    current.current.points.push(pos(e));
    redraw();
  }

  function up() {
    if (!current.current) return;
    strokes.current.push(current.current);
    current.current = null;
    setDirty(true);
    redraw();
  }

  const toolBtn = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 px-3 h-9 border rounded-[2px] text-[11px] uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer",
      active
        ? "border-brass-400 text-brass-300 bg-brass-500/10"
        : "border-bone-100/15 text-stone-400 hover:border-bone-100/30"
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button type="button" className={toolBtn(tool === "brass")} onClick={() => setTool("brass")}>
          <Pen className="size-3.5" /> Brass pen
        </button>
        <button type="button" className={toolBtn(tool === "bone")} onClick={() => setTool("bone")}>
          <Pen className="size-3.5" /> Bone pen
        </button>
        <button type="button" className={toolBtn(tool === "erase")} onClick={() => setTool("erase")}>
          <Eraser className="size-3.5" /> Erase
        </button>
        <span className="flex-1" />
        <button
          type="button"
          className={toolBtn(false)}
          onClick={() => {
            strokes.current.pop();
            setDirty(strokes.current.length > 0);
            redraw();
          }}
        >
          <RotateCcw className="size-3.5" /> Undo
        </button>
        <button
          type="button"
          className={toolBtn(false)}
          onClick={() => {
            strokes.current = [];
            setDirty(false);
            redraw();
          }}
        >
          <Trash2 className="size-3.5" /> Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="w-full aspect-[4/3] border rule-strong touch-none cursor-crosshair bg-forge-850"
        aria-label="Sketch area — draw rough zones like patio here, lawn there"
      />

      <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
        <p className="text-[11.5px] text-stone-500">
          Rough is the point — blobs and labels beat draughtsmanship.
        </p>
        <button
          type="button"
          disabled={!dirty || exporting || disabled}
          onClick={async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            setExporting(true);
            canvas.toBlob(async (blob) => {
              if (blob) await onExport(blob);
              setExporting(false);
            }, "image/png");
          }}
          className={cn(
            "h-10 px-5 bg-brass-500 hover:bg-brass-400 text-forge-950 text-[11.5px] font-semibold uppercase tracking-[0.14em] rounded-[2px] transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          {exporting ? "Saving…" : "Attach sketch to brief"}
        </button>
      </div>
    </div>
  );
}
