import { WorldEventSignal } from "./signal";

import type { Player } from "../player";
import type { WorldEvent } from "../enums";

class PlayerMissSwingSignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent.PlayerMissSwing;

	/**
	 * The player that miss the arm swing.
	 */
	public readonly player: Player;

	/**
	 * Constructs a new player miss swing after signal instance.
	 * @param player The player that missed the arm swing.
	 */
	public constructor(player: Player) {
		super(player.dimension.world);
		this.player = player;
	}
}

export { PlayerMissSwingSignal };
