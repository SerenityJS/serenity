import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

import type { Serenity } from "../serenity";

class Console {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	/**
	 * The console interface.
	 */
	public readonly interface = createInterface(stdin, stdout);

	/**
	 * The console constructor.
	 * @param serenity The serenity instance.
	 */
	public constructor(serenity: Serenity) {
		this.serenity = serenity;

		// Set the prompt
		this.interface.setPrompt("> ");

		// Hook the events
		this.interface.on("line", this.onLine.bind(this));
	}

	/**
	 * Handles the console input.
	 * @param line The input line.
	 */
	protected onLine(line: string): void {
		// Check if the line starts with a /
		// If so, slice the line and execute the command
		const command = line.startsWith("/") ? line.slice(1) : line;

		// Attempt to execute the command
		try {
			// Get the default world of the serenity instance
			const world = this.serenity.worlds.get();

			// Get the default dimension of the world
			const dimension = world.getDimension();

			// Execute the command
			const execute = dimension.executeCommand(command);

			// Check if the command is undefined
			if (!execute) return;

			// Log the command to the console
			this.serenity.logger.info(`§a${execute.message}§r`);
		} catch (reason) {
			// Check if the reason is a type error
			if (reason instanceof TypeError) {
				this.serenity.logger.warn(
					`§cType Error: ${(reason as Error).message}§r`
				);
			} else {
				this.serenity.logger.warn(`§c${(reason as Error).message}§r`);
			}
		}
	}
}

export { Console };
