import { CliCommand } from "./command";

import type { StartCommandOptions } from "../types";
import type { ArgumentsCamelCase, Argv } from "yargs";

class StartCommand extends CliCommand {
	public name: string = "start";
	public description: string = "Starts the Minecraft server";

	public register(registry: Argv): void {
		registry.usage("Usage: $0 start [options]").option("maxMemory", {
			alias: "maxM",
			description: "Set the maximum memory for the server",
			type: "string"
		});
	}

	public async handle(
		options: ArgumentsCamelCase<StartCommandOptions>
	): Promise<void> {
		// Handle command-line arguments and options
		if (options.maxMemory) {
			// Set the maximum memory for the server
		}
		console.log("Starting the server...");
		// Implement server starting logic here
		console.log("Server started successfully!");
	}
}

export { StartCommand };
