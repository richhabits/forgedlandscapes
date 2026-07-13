"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The assessor is a ~450-line chat widget with its own geo/AI logic. It sits at
// the bottom of every marketing page but is rarely the first thing touched, so
// we keep it out of the initial bundle and hydrate it once the browser is idle.
const AssessorWidget = dynamic(
  () => import("./assessor-widget").then((m) => m.AssessorWidget),
  { ssr: false },
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function AssessorMount() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true));
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return ready ? <AssessorWidget /> : null;
}
