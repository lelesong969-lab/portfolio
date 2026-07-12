import { fixupConfigRules } from "@eslint/compat";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const nextConfig = fixupConfigRules([...nextVitals, ...nextTypeScript]);

export default defineConfig(nextConfig);
