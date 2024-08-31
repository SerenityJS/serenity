import { spawnSync } from "node:child_process";

import { check, sleep } from "../utils";

import { CliCommand } from "./command";

import type { Argv } from "yargs";

// TODO: Clean up
class CreateCommand extends CliCommand {
	public name: string = "create";
	public description = "Create a new SerenityJS project";

	private static readonly repositories = [
		"https://github.com/SerenityJS/Serenity", // Stable branch
		"https://github.com/SerenityJS/Serenity", // Beta branch
		"https://github.com/SerenityJS/Serenity" // Development branch
	];

	public register(registry: Argv): void {
		registry.usage("Usage: $0 create");
	}

	public async handle(): Promise<void> {
		const prompt = await import("@clack/prompts");
		console.clear();

		prompt.intro("Create a new Serenity server");

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

		if (prompt.isCancel(selection)) return;
		console.clear();

		const spinner = prompt.spinner();
		const repoUrl = CreateCommand.repositories[selection];

		if (selection === 2) {
			spinner.start("Checking if git is available on your system...");
			await sleep(1000);

			if (!CreateCommand.hasGit()) {
				spinner.stop(
					"Failed to find git installed on your system. Please install git and try again."
				);
				return;
			}

			if (!CreateCommand.hasYarn()) {
				spinner.stop(
					"Failed to find yarn installed on your system. Please install yarn and try again."
				);
				return;
			}
		}
		if (!repoUrl) return;

		spinner.start("Downloading local clone of the SerenityJS repository");
		await sleep(1000);

		this.clone(repoUrl);
		spinner.stop("Repository cloned successfully.");
	}

	private clone(repoUrl: string): void {
		if (!CreateCommand.hasGit()) {
			console.error("Git is required to clone the Serenity repository.");
			return;
		}
		spawnSync("git", ["clone", repoUrl]);
	}

	private static hasGit(): boolean {
		return check("git", ["--version"]);
	}

	private static hasYarn(): boolean {
		return check("yarn", ["--version"]);
	}
}

export { CreateCommand };
