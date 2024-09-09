import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import * as JSON5 from "json5";
import { sync } from "cross-spawn";

import type { PlopTypes } from "@turbo/gen";

const WorkspaceConfigName = "serenityjs.code-workspace";
const WorkflowsLocation = ".github/workflows";
const PackagesRoot = "packages";

function validateProjectName(input: string): string | boolean {
	const lowerCaseWithDashes = /^[\da-z-]+$/;

	if (!lowerCaseWithDashes.test(input)) {
		return "Project name must be lowercase and contain only letters, numbers, and dashes";
	}

	return true;
}

interface WorkspaceConfigMin {
	folders: Array<{ path: string; name: string }>;
}

interface HelperMin {
	fn: CallableFunction;
}

const packageJsonPath = resolve(process.cwd(), "package.json");
function getPackageJson(): object {
	return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}
function getCurrentRepoVersion(): string {
	// @ts-expect-error idc
	return getPackageJson().version ?? "0.0.0";
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	const version = getCurrentRepoVersion();
	const package_ = getPackageJson();

	// Add raw block helper
	plop.addHelper("raw", (options: HelperMin) => options.fn());

	// Add root package version to handlebars

	// Creates a new action in plop that allows running commands.
	plop.setActionType("runCommand", (answers, config) => {
		if (
			!config?.data ||
			!("command" in config.data) ||
			typeof config.data.command !== "string"
		) {
			throw new Error("No command provided");
		}
		const command = plop.renderString(config.data.command, answers);
		const result = sync(command, { stdio: "inherit" });

		if (result.error) {
			throw result.error;
		}

		return command;
	});

	// Creates a new action in plop that allows updating the workspace config.
	plop.setActionType("updateWorkspaceConfig", (answers: { type?: "Rust" }) => {
		const pathToWorkspaceConfig = plop.renderString(
			`{{ turbo.paths.root }}/.vscode/${WorkspaceConfigName}`,
			answers
		);
		const workspaceConfig = JSON5.parse(
			readFileSync(pathToWorkspaceConfig, "utf8")
		) as WorkspaceConfigMin;

		const emoji = answers?.type === "Rust" ? "🦀" : "📦";
		const name = plop.renderString(`${emoji} {{ titleCase name }}`, answers);
		const path = plop.renderString("{{ dashCase name }}", answers);

		workspaceConfig.folders.push({
			name,
			path: `../${PackagesRoot}/${path}`
		});

		// Write the updated config back to the file
		writeFileSync(
			pathToWorkspaceConfig,
			JSON.stringify(workspaceConfig, null, 2)
		);

		return `Appended ${name} to workspace config`;
	});

	// Adds a package generator
	plop.setGenerator("Package", {
		description: "Creates a new package in the workspace",
		prompts: [
			{
				type: "list",
				name: "type",
				message: "What type of package do you want to create?",
				choices: ["TypeScript" /*, "Rust"*/]
			},
			{
				type: "confirm",
				name: "useCI",
				default: false,
				message: "Would you like to use CI for this package?",
				when: (answers) => answers.type === "Rust"
			},
			{
				type: "input",
				name: "name",
				message: "What is the name of the new package?",
				validate: validateProjectName
			}
		],
		actions: [
			{
				type: "addMany",
				destination: `{{ turbo.paths.root }}/${PackagesRoot}/{{ dashCase name }}`,
				base: "templates/{{ lowerCase type }}",
				templateFiles: "templates/{{ lowerCase type }}/**/*",
				globOptions: {
					dot: true
				},
				data: {
					version,
					pkg: package_
				},
				skipIfExists: true
			},
			// doci
			{
				type: "add",
				path: `{{ turbo.paths.root }}/${WorkflowsLocation}/{{ dashCase name }}-ci.yml`,
				templateFile: "templates/rust-ci.yml.hbs",
				data: {
					version,
					pkg: package_
				},
				skip: (answers: { useCI?: boolean }) => {
					if (!answers.useCI) {
						return "Skipping CI file creation";
					}
				}
			},
			{
				type: "updateWorkspaceConfig",
				data: {
					type: "package"
				}
			},
			{
				type: "runCommand",
				data: {
					command: "yarn install"
				}
			}
		]
	});
}
