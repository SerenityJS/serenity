import { Player } from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { DefaultCommands } from "./defaults/index.js";

import type { Command } from "./command.js";

class Commands {
	private commands: Map<string, Command> = new Map();
	private logger: Logger;

	public constructor() {
		this.logger = new Logger("Commands", LoggerColors.Yellow);

		void this.start();
	}

	public async start(): Promise<void> {
		const commands = DefaultCommands;

		await Promise.all(
			commands.map(async (command: Command) => {
				this.commands.set(command.name, command);
				this.logger.debug("Command: " + command.name + " has been registered.");
			})
		);
	}

	public async dispatchCommand(sender: Player, commandInput: string) {
		const id = commandInput.split(" ")[0];

		for (const command of this.commands.values()) {
			if (
				command.name.split(":")[1] === id ||
				command.aliases?.includes(id as string)
			) {
				const _arguments = commandInput.replace(`${id} `, "").split(" ");
				await command.execute(sender, _arguments);
				break;
			}
		}
	}

	public getCommands(): Map<string, Command> {
		return this.commands;
	}
}

export { Commands };
