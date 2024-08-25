import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";

class PlayerExecuteCommandSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerExecuteCommand;

	/**
	 * The player that executed the command.
	 */
	public readonly player: Player;

	/**
	 * The command that was executed.
	 */
	public command: string;

	/**
	 * Creates a new instance of the PlayerExecuteCommandSignal class.
	 * @param player The player that executed the command.
	 * @param command The command that was executed.
	 */
	public constructor(player: Player, command: string) {
		super(player.dimension.world);
		this.player = player;
		this.command = command;
	}
}

export { PlayerExecuteCommandSignal };
