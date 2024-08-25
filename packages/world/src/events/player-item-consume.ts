import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { ItemStack } from "../item";
import type { Player } from "../player";

class PlayerItemConsumeSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerItemConsume;

	/**
	 * The player consuming the item
	 */
	public readonly player: Player;

	/**
	 * The item stack that is being consumed
	 */
	public readonly itemStack: ItemStack;

	/**
	 * Creates a new player item consume signal.
	 * @param player The player consuming the item.
	 * @param itemStack The item stack that is being consumed.
	 */
	public constructor(player: Player, itemStack: ItemStack) {
		super(player.dimension.world);
		this.player = player;
		this.itemStack = itemStack;
	}
}

export { PlayerItemConsumeSignal };
