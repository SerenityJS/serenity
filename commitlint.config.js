module.exports = {
  extends: ["@commitlint/config-angular"],
  rules: {
    "scope-case": [2, "always", "lower-case"],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "refactor", "test", "chore", "misc"],
    ],
    "header-max-length": [2, "always", 120],
  },
};
