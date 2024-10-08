import { config, configs } from "@ariesclark/eslint-config";
import node from "@ariesclark/eslint-config/node";

export const serenity = config({
  extends: [...configs.recommended, ...node],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: false,
        jsxSingleQuote: false,
        trailingComma: "none",
      },
      {
        usePrettierrc: false,
      },
    ],
    "@typescript-eslint/no-extraneous-class": "off",
  },
});

export { config };
