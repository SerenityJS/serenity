import { CliCommand } from "./command";

import type { PluginCommandOptions } from "../types";
import type { ArgumentsCamelCase, Argv } from "yargs";

class PluginCommand extends CliCommand {
	public name = "plugin";

	public description: string = "Plugin command (not implemented yet).";

	public register<T = object>(registry: Argv<T>): void {
		// ? --- Command usage ---
		registry.usage("Usage: $0 plugin <command> [options]");

		// ? --- Flags ---
		registry.option("bundle", {
			alias: "b",
			description: "Bundle all plugins into a single file."
		});

		registry.option("create", {
			alias: "c",
			description: "Create a new plugin."
		});

		registry.conflicts("bundle", "create");

		// Check if either bundle or create is specified
		registry.check((argv) => {
			if (!argv.bundle && !argv.create)
				throw new Error("You must specify either --bundle or --create.");

			return true;
		});
	}

	public async handle(
		options: ArgumentsCamelCase<PluginCommandOptions>
	): Promise<void> {
		// Handle plugin command
		if (options.bundle) {
			console.log("Bundling all plugins...");
		} else if (options.create) {
			console.log("Creating a new plugin...");
		}
	}
}

export { PluginCommand };
