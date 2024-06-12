// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	ignorePatterns: ["launcher", "packages"],
	extends: ["@serenityjs/eslint-config/index.js"],
	parserOptions: {
		project: true
	}
};
