import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";

class PlayerStartSwimmingSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerStartSwimming;

	/**
	 * The player that stopped swimming.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player stopped swimming signal.
	 */
	public constructor(player: Player) {
		super(player.dimension.world);
		this.player = player;
	}
}

export { PlayerStartSwimmingSignal };
