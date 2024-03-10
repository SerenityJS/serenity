/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@serenityjs/eslint-config/index.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
