// k6 load test — Forged Landscapes.
//
// ⚠️ Run ONLY against a Vercel PREVIEW/staging deploy, never production, and only
// against READ-ONLY endpoints. Do not POST fake leads at scale into the real DB.
//
//   brew install k6
//   BASE=https://<your-preview>.vercel.app k6 run audit/load-test.js
//
// Finds the breaking point before real 100x traffic does. Thresholds are the
// audit targets (p95 < 800ms, <1% errors).

import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp
    { duration: "1m", target: 50 }, // sustain
    { duration: "1m", target: 100 }, // push (≈100x a quiet local trade)
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const home = http.get(`${BASE}/`);
  check(home, { "home 200": (r) => r.status === 200 });

  const town = http.get(`${BASE}/areas/st-albans`);
  check(town, { "town 200": (r) => r.status === 200 });

  // Public read API (postcode radius) — safe to hammer.
  const geo = http.get(`${BASE}/api/geo?postcode=WD17`);
  check(geo, { "geo 200": (r) => r.status === 200 });

  sleep(1);
}
