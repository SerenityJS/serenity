import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";

class PlayerJumpSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerJump;

	/**
	 * The player that jumped.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player jump event signal.
	 */
	public constructor(player: Player) {
		super(player.dimension.world);
		this.player = player;
	}
}

export { PlayerJumpSignal };
