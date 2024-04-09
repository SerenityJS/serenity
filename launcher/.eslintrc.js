/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: ["@serenityjs/eslint-config/index.js"],
	parserOptions: {
		project: true
	},
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off"
	}
};
