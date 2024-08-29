import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";

class PlayerStopSwimmingSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerStopSwimming;

	/**
	 * The player that started swimming.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player started swimming signal.
	 */
	public constructor(player: Player) {
		super(player.dimension.world);
		this.player = player;
	}
}

export { PlayerStopSwimmingSignal };
