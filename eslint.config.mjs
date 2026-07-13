import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "shots.mjs",
    "probe-map.mjs",
    // Tooling scripts, not part of the Next app (k6 runtime, own globals).
    "audit/**",
    "scripts/**",
  ]),
  {
    rules: {
      // Copy-heavy UK marketing site — literal apostrophes in JSX are house style.
      "react/no-unescaped-entities": "off",
      // Off by design: every occurrence is an intentional client-only mount read
      // (localStorage consent, auth/session boot) that MUST run in an effect for
      // SSR safety. This experimental rule over-flags that valid pattern.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
