#!/usr/bin/env node

import "./locale";
import yargs, { command } from "yargs";

yargs.scriptName("");
yargs.help("help", "Show all commands for SerenityJS.");

command(
	"plugin",
	"Interact with SerenityJS plugins.",
	(yargs) => {
		// Command usage
		yargs.usage("Usage: $0 plugin <command> [options]");

		// Bundle flag
		yargs.option("bundle", {
			alias: "b",
			description: "Bundle all plugins into a single file."
		});

		// Create flag
		yargs.option("create", {
			alias: "c",
			description: "Create a new plugin."
		});

		// Demands either bundle or create
		yargs.conflicts("bundle", "create");

		// Check if either bundle or create is specified
		yargs.check((argv) => {
			if (!argv.bundle && !argv.create)
				throw new Error("You must specify either --bundle or --create.");

			return true;
		});
	},
	(argv) => {
		if (argv.create) {
			console.log("Creating a new plugin...");
		}

		if (argv.bundle) {
			console.log("Bundling all plugins...");
		}
	}
);

yargs.demandCommand(1, 1);

yargs.parse();
