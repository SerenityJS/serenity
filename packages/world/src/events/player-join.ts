import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { World } from "../world";
import type { Player } from "../player";

class PlayerJoinSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerJoin;

	/**
	 * The player joining the world.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player join event signal.
	 * @param player The player joining the world..
	 */
	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public getWorld(): World {
		return this.player.dimension.world;
	}
}

export { PlayerJoinSignal };
