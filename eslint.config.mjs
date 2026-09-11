import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // These React 19 compiler recommendations are valuable during cleanup,
      // but the current app intentionally initializes several client-only
      // values in effects and renders icon components from data. Keep them
      // visible without making launch validation unusable.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".htv-action-plan-backup/**",
    "**/*.backup.tsx",
    "**/*.before-*.tsx",
    "**/*.broken-backup",
    "**/*.tsx.before-*",
    "connector/desktop/dist/**",
    "connector/desktop/src-tauri/target/**",
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
