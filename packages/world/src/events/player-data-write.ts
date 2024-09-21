import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { CompoundTag } from "@serenityjs/nbt";
import type { Player } from "../player";

class PlayerDataWriteSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerDataWrite;

	/**
	 * The player that the data is being written for.
	 */
	public readonly player: Player;

	/**
	 * The data being written for the player.
	 */
	public readonly data: CompoundTag<unknown>;

	/**
	 * Creates a new instance of the PlayerDataWriteSignal class.
	 * @param player The player that the data is being written for.
	 * @param data The data being written for the player.
	 */
	public constructor(player: Player, data: CompoundTag<unknown>) {
		super(player.dimension.world);
		this.player = player;
		this.data = data;
	}
}

export { PlayerDataWriteSignal };
