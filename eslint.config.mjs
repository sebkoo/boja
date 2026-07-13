import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // apps/mobile lints with Expo's own config, not this one.
  { ignores: ["**/dist/**", "**/coverage/**", "apps/mobile/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
