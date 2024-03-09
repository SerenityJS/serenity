require("@ariesclark/eslint-config/eslint-patch");
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");
process.env["ESLINT_PROJECT_ROOT"] = process.cwd();

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "@ariesclark/eslint-config",
		"@ariesclark/eslint-config/next",
		"@ariesclark/eslint-config/tailwindcss",
    "eslint-config-turbo"
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    "node_modules/",
  ],
};
