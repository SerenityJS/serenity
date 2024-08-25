import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { DisconnectReason } from "@serenityjs/protocol";
import type { Player } from "../player";

class PlayerLeaveSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerLeave;

	/**
	 * The player leaving the world.
	 */
	public readonly player: Player;

	/**
	 * The reason the player left the world.
	 */
	public readonly reason: DisconnectReason;

	/**
	 * The message that was displayed to the player, if applicable.
	 */
	public readonly message: string;

	/**
	 * Creates a new player join event signal.
	 * @param player The player leaving the world.
	 * @param reason The reason the player left the world.
	 * @param message The message that was displayed to the player, if applicable.
	 */
	public constructor(
		player: Player,
		reason: DisconnectReason,
		message: string
	) {
		super(player.dimension.world);
		this.player = player;
		this.reason = reason;
		this.message = message;
	}
}

export { PlayerLeaveSignal };
