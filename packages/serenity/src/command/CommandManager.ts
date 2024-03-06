import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import type { Player, Serenity } from '../index.js';
import type { Command } from './Command.js';

class CommandManager {
	private readonly serenity: Serenity;
	private commands: Map<string, Command> = new Map();

	public constructor(serenity: Serenity) {
		this.serenity = serenity;
    
     void this.start();
	}

	public async start(): Promise<void> {
		const commands = readdirSync(fileURLToPath(new URL('defaults', import.meta.url)))
			.filter((name) => !name.includes('.d.ts') && !name.includes('.map'))
			.map((name) => '/defaults/' + name);

		await Promise.all(
			commands.map(async (name: string) => {
				const { default: Command } = await import('./' + name);
				const command: Command = new Command();

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
