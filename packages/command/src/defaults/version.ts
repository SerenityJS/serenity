import { Player } from "@serenityjs/world";

import { Command } from "../command.js";

class VersionCommand extends Command {
	public constructor() {
		super(
			"serenity:version",
			"Displays server information",
			"serenity.command.version",
			["ver"]
		);
	}

	public async execute(
		player: Player,
		_arguments: Array<string>
	): Promise<undefined> {
		player.sendMessage(`This server is running on SerenityJS.`);
	}
}

export { VersionCommand };
