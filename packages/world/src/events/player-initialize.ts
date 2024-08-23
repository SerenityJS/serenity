import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { World } from "../world";
import type { Player } from "../player";

class PlayerInitializeSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerInitialize;

	/**
	 * The player that initialized.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player join event signal.
	 * @param player The player that initialized..
	 */
	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public getWorld(): World {
		return this.player.dimension.world;
	}
}

export { PlayerInitializeSignal };
