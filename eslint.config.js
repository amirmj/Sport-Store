import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/main/resources/static/storefront/*.js"],
    languageOptions: { globals: globals.browser },
  },
  { files: ["test/*.js"], languageOptions: { globals: globals.node } },
];
