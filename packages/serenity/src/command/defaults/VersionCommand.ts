import type { Player } from '../../index.js';
import { Command } from '../Command.js';

class VersionCommand extends Command {
	public constructor() {
		super('serenity:version', 'Displays server information', 'serenity.command.version', ['ver']);
	}

	public async execute(player: Player, args: any[]): Promise<any> {
		player.sendMessage(`This server is running on SerenityJS.`);
	}
}

export default VersionCommand;
