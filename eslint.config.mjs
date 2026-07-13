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
  ]),
  {
    rules: {
      // Copy-heavy UK marketing site — literal apostrophes in JSX are house style.
      "react/no-unescaped-entities": "off",
      // Deliberate, contained patterns (hydration-gated banners, session boot).
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
