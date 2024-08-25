import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";

class PlayerChatSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerChat;

	/**
	 * The player that sent the message.
	 */
	public readonly player: Player;

	/**
	 * The message that was sent.
	 */
	public message: string;

	/**
	 * Creates a new instance of the PlayerChatSignal class.
	 * @param player The player that sent the message.
	 * @param message The message that was sent.
	 */
	public constructor(player: Player, message: string) {
		super(player.dimension.world);
		this.player = player;
		this.message = message;
	}
}

export { PlayerChatSignal };
