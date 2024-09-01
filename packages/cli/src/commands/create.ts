/* eslint-disable no-async-promise-executor */
/* eslint-disable unicorn/import-style */
import { exec, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { sleep } from "../utils";
import { NPM_CREATE } from "../scripts";
import {
	INDEX_TEMPLATE,
	START_TEMPLATE,
	TSCONFIG_TEMPLATE
} from "../templates";
import { COMMON_PACKAGES, SERENITY_PACKAGES } from "../packages";

import { CliCommand } from "./command";

import type { ArgumentsCamelCase, Argv } from "yargs";

// Command to create a new SerenityJS project
class CreateCommand extends CliCommand {
	public name: string = "create";
	public description = "Create a new SerenityJS server project.";

	// URLs for different branches of the SerenityJS repository
	private static readonly repositories = [
		"https://github.com/SerenityJS/Serenity", // Stable branch
		"https://github.com/SerenityJS/Serenity", // Beta branch
		"https://github.com/SerenityJS/Serenity" // Development branch
	];

	public register(registry: Argv): void {
		// Register command usage
		registry.usage("Usage: $0 create");

		// Register command options
		registry.option("latest", {
			alias: "l",
			description: "Create a new server with the latest features."
		});

		// Register command options
		registry.option("beta", {
			alias: "b",
			description: "Create a new server with new upcoming features."
		});
	}

	public async handle(options: ArgumentsCamelCase): Promise<void> {
		// TODO: Preinstall checks

		// Import clack prompts & chalk
		const Clack = await import("@clack/prompts");
		const { Chalk } = await import("chalk");

		// Create a new instance of Chalk
		const chalk = new Chalk();

		// Clear the console and display the introduction message
		console.clear();

		Clack.intro(chalk.hex("#8560e9")("SerenityJS Installation Wizard"));
		Clack.note(
			"This installation wizard will help setup the perfect server for your project."
		);
		const spin = Clack.spinner();

		spin.start("Preparing workspace environment...");

		// Check if the package.json file exists
		if (!existsSync(resolve(process.cwd(), "package.json"))) {
			// Create a new package.json file
			writeFileSync("package.json", JSON.stringify({}, null, 2));
			Clack.log.info(`Created ${chalk.hex("#8560ef")("package.json")} file.`);
		}

		// Check if a tsconfig.json file exists
		if (!existsSync(resolve(process.cwd(), "tsconfig.json"))) {
			// Create a new tsconfig.json file
			writeFileSync("tsconfig.json", TSCONFIG_TEMPLATE);
			Clack.log.info(`Created ${chalk.hex("#8560e9")("tsconfig.json")} file.`);
		}

		// Check if a src directory exists
		if (!existsSync(resolve(process.cwd(), "src"))) {
			// Create a new src directory
			mkdirSync("src");

			// Write an index.ts file
			writeFileSync(resolve(process.cwd(), "src", "index.ts"), INDEX_TEMPLATE);
			Clack.log.info(`Created ${chalk.hex("#8560e9")("src")} directory.`);
		}

		// Check if a start.bat file exists
		if (!existsSync(resolve(process.cwd(), "start.bat"))) {
			// Create a new start.bat file
			writeFileSync("start.bat", START_TEMPLATE);
			Clack.log.info(`Created ${chalk.hex("#8560e9")("start.bat")} file.`);
		}

		// Execute the NPM_CREATE scripts
		// This will format the package.json file
		await sleep(1000);
		spin.message("Formatting package.json file");
		await Promise.all(
			NPM_CREATE.map(async (script) => {
				exec(script);
				await sleep(100);
			})
		);

		await sleep(1000);
		spin.stop(chalk.greenBright("Workspace environment prepared."));

		// Check if the user has used a specific flag
		// This will skip the prompt if a flag is used
		if (options.latest) return this.installLatest();
		if (options.beta) return this.installBeta();

		// Install the latest version of SerenityJS
		return this.installLatest();
	}

	private async installLatest(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			// Import clack prompts
			const Clack = await import("@clack/prompts");
			const { Chalk } = await import("chalk");

			// Create a new instance of Chalk
			const chalk = new Chalk();

			// Create a new spinner
			const spinner = Clack.spinner();
			spinner.start("Installing the latest version of SerenityJS");

			// Get the list of packages to install
			const packages = [
				...COMMON_PACKAGES,
				...SERENITY_PACKAGES.map((package_) => `${package_}@latest`)
			];

			// Install the latest version of SerenityJS
			const process = spawn("npm", ["install", "--save-dev", ...packages], {
				stdio: "ignore",
				shell: true
			});

			// Wait for the process to exit
			process.once("exit", (code) => {
				if (code === 0) {
					spinner.stop(
						chalk.greenBright("SerenityJS latest installed successfully.")
					);
					resolve();
				} else {
					spinner.stop(chalk.redBright("Failed to install SerenityJS."));
					reject();
				}
			});
		});
	}

	private async installBeta(): Promise<void> {
		return new Promise(async (resolve, reject) => {
			// Import clack prompts
			const Clack = await import("@clack/prompts");
			const { Chalk } = await import("chalk");

			// Create a new instance of Chalk
			const chalk = new Chalk();

			// Create a new spinner
			const spinner = Clack.spinner();
			spinner.start("Installing the beta version of SerenityJS");

			// Get the list of packages to install
			const packages = [
				...COMMON_PACKAGES,
				...SERENITY_PACKAGES.map((package_) => `${package_}@beta`)
			];

			// Install the beta version of SerenityJS
			const process = spawn("npm", ["install", "--save-dev", ...packages], {
				stdio: "ignore",
				shell: true
			});

			// Wait for the process to exit
			process.once("exit", (code) => {
				if (code === 0) {
					spinner.stop(
						chalk.greenBright("SerenityJS beta installed successfully.")
					);
					resolve();
				} else {
					spinner.stop(chalk.redBright("Failed to install SerenityJS."));
					reject();
				}
			});
		});
	}
}

export { CreateCommand };
