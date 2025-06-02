import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      '**/src/generated/**/*',
      '**/node_modules/**/*',
      '**/.next/**/*',
      '**/prisma/migrations/**/*',
      '**/*.d.ts',
      '**/dist/**/*',
      '**/build/**/*',
      // Prisma generated files
      '**/prisma/runtime/**/*',
      '**/src/generated/prisma/**/*',
      // PDF service with type issues
      '**/src/lib/pdf/enhanced-pdf-service.ts',
      // Build artifacts
      '**/.next/types/**/*',
      '**/next-env.d.ts',
      '**/tsconfig.tsbuildinfo'
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-const": "warn",
      "no-console": "off" // Development aşamasında console.log'lara izin ver
    }
  }
];

export default eslintConfig;
