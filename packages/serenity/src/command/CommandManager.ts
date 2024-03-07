import type { Player, Serenity } from '../index.js';
import type { Command } from './Command.js';
import { DefaultCommands } from './defaults/index.js';

class CommandManager {
	private readonly serenity: Serenity;
	private commands: Map<string, Command> = new Map();

	public constructor(serenity: Serenity) {
		this.serenity = serenity;

		void this.start();
	}

	public async start(): Promise<void> {
		const commands = DefaultCommands;

		await Promise.all(
			commands.map(async (command: Command) => {
				this.commands.set(command.name, command);
				this.serenity.logger.debug('Command: ' + command.name + ' has been registered.');
			}),
		);
	}

	public async dispatchCommand(sender: Player, commandInput: string) {
		const id = commandInput.split(' ')[0];

		for (const command of this.commands.values()) {
			if (command.name.split(':')[1] === id || command.aliases?.includes(id)) {
				const args = commandInput.replace(`${id} `, '').split(' ');
				await command.execute(sender, args);
				break;
			}
		}
	}

	public getCommands(): Map<string, Command> {
		return this.commands;
	}
}

export { CommandManager };
