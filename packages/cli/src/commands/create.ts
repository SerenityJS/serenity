import { spawnSync } from "node:child_process";

import { check, sleep } from "../utils";

import { CliCommand } from "./command";

import type { Argv } from "yargs";

// Command to create a new SerenityJS project
class CreateCommand extends CliCommand {
	public name: string = "create";
	public description = "Create a new SerenityJS project";

	// URLs for different branches of the SerenityJS repository
	private static readonly repositories = [
		"https://github.com/SerenityJS/Serenity", // Stable branch
		"https://github.com/SerenityJS/Serenity", // Beta branch
		"https://github.com/SerenityJS/Serenity" // Development branch
	];

	public register(registry: Argv): void {
		// Register command usage
		registry.usage("Usage: $0 create");
	}

	public async handle(): Promise<void> {
		const prompt = await import("@clack/prompts");
		console.clear();

		// Introduction message
		prompt.intro("Create a new Serenity server");

		// Prompt user to select the server branch
		const selection = await prompt.select({
			message: "Server branch",
			initialValue: 0,
			options: [
				{
					value: 0,
					hint: "Includes the latest features and bug fixes.",
					label: "Latest (recommended)"
				},
				{
					value: 1,
					hint: "Includes new upcoming features, may be unstable and contain bugs.",
					label: "Beta"
				},
				{
					value: 2,
					hint: "Clones the latest development branch from GitHub.",
					label: "Development"
				}
			]
		});

		// Handle cancel action
		if (prompt.isCancel(selection)) return;

		// Clear console for a clean output
		console.clear();

		// Get the repository URL based on the user's selection
		const spinner = prompt.spinner();
		const repoUrl = CreateCommand.repositories[selection];

		// Check for required tools if the Development branch is selected
		if (selection === 2) {
			spinner.start("Checking if git is available on your system...");
			await sleep(1000);

			if (!CreateCommand.hasGit()) {
				spinner.stop("Git is not installed. Please install git and try again.");
				return;
			}

			if (!CreateCommand.hasYarn()) {
				spinner.stop(
					"Yarn is not installed. Please install yarn and try again."
				);
				return;
			}
		}

		// Ensure the repository URL is valid
		if (!repoUrl) return;

		// Clone the selected repository
		spinner.start("Downloading local clone of the SerenityJS repository");
		await sleep(1000);
		this.clone(repoUrl);
		spinner.stop("Repository cloned successfully.");
	}

	private clone(repoUrl: string): void {
		// Ensure Git is available before attempting to clone
		if (!CreateCommand.hasGit()) {
			console.error("Git is required to clone the Serenity repository.");
			return;
		}

		spawnSync("git", ["clone", repoUrl]);
	}

	private static hasGit(): boolean {
		// Check if Git is installed by verifying its version
		return check("git", ["--version"]);
	}

	private static hasYarn(): boolean {
		// Check if Yarn is installed by verifying its version
		return check("yarn", ["--version"]);
	}
}

export { CreateCommand };
