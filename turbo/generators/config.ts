import { readFileSync, writeFileSync } from "node:fs";

import * as JSON5 from "json5";
import { PlopTypes } from "@turbo/gen";
import { sync } from "cross-spawn";

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

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	// Add raw block helper
	plop.addHelper("raw", (options: HelperMin) => options.fn());

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
	plop.setActionType("updateWorkspaceConfig", (answers) => {
		const pathToWorkspaceConfig = plop.renderString(
			`{{ turbo.paths.root }}/.vscode/${WorkspaceConfigName}`,
			answers
		);
		const workspaceConfig = JSON5.parse(
			readFileSync(pathToWorkspaceConfig, "utf8")
		) as WorkspaceConfigMin;

		const name = plop.renderString(`📦 {{ titleCase name }}`, answers);
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
				choices: ["TypeScript", "Rust"]
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
				skipIfExists: true
			},
			// doci
			{
				type: "add",
				path: `{{ turbo.paths.root }}/${WorkflowsLocation}/{{ dashCase name }}/ci.yml`,
				templateFile: "templates/rust-ci.yml.hbs",
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
