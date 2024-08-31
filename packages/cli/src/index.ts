#!/usr/bin/env node

import "./locale";

import yargs from "yargs";

import * as CliCommands from "./commands/index";

// Import all commands from the commands directory
import type { CliCommand } from "./commands/index";

class Cli {
	public static readonly commands: Map<string, CliCommand> = new Map();

	public constructor() {
		// initialize the cli
		this.init();
		// Parse the command line arguments and exit if no command is provided
		yargs.demandCommand(1, 1);

		// Parse the command line arguments and exit if any error occurs during parsing or execution of the command
		void yargs.parse();
	}

	// Initialize the CLI with yargs and register commands
	private init(): void {
		yargs.scriptName("");
		yargs.help("help", "Show all commands for SerenityJS.");

		// Register all commands in the commands map
		for (const commandKey in CliCommands) {
			const command = CliCommands[commandKey as keyof typeof CliCommands];

			Cli.register(new command());
		}
	}

	public static register(cliCommand: CliCommand): void {
		if (Cli.commands.has(cliCommand.name)) return;
		// Register the command in yargs
		yargs.command(
			cliCommand.name,
			cliCommand.description,
			cliCommand.register,
			(arguments_) => cliCommand.handle(arguments_)
		);

		// Add the command to the commands map
		Cli.commands.set(cliCommand.name, cliCommand);
	}
}

// Create a new instance of the CLI
new Cli();
