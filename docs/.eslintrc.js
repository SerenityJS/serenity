/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: ["@serenityjs/eslint-config/next.js"],
	parserOptions: {
		project: true
	}
};
