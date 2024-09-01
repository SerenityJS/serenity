import { spawn } from "node:child_process";

import { CliCommand } from "./command";

import type { StartCommandOptions } from "../types";
import type { ArgumentsCamelCase, Argv } from "yargs";

class StartCommand extends CliCommand {
	public name: string = "start";
	public description: string = "Starts the SerenityJS server.";

	public register(registry: Argv): void {
		registry.usage("Usage: $0 start [options]");

		registry.option("maxMemory", {
			alias: "mem",
			description: "Set the maximum memory usage for the server.",
			type: "string"
		});
	}

	public async handle(
		options: ArgumentsCamelCase<StartCommandOptions>
	): Promise<void> {
		// TODO: Check for updates

		// Handle command-line arguments and options
		if (options.maxMemory) {
			// TODO: Set the maximum memory usage for the server
		}

		spawn("npm", ["exec", "ts-node", "src/index.ts"], {
			stdio: "inherit",
			shell: true
		});
	}
}

export { StartCommand };
