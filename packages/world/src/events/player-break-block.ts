import { WorldEvent } from "../enums";

import { BlockUpdateSignal } from "./block-update";

import type { ItemStack } from "../item";
import type { Block } from "../block";
import type { Player } from "../player";

class PlayerBreakBlockSignal extends BlockUpdateSignal {
	public static readonly identifier = WorldEvent.PlayerBreakBlock;

	/**
	 * The player placing the block.
	 */
	public readonly player: Player;

	/**
	 * The item stack that is being used to break the block, or null if empty hand.
	 */
	public readonly itemStack: ItemStack | null;

	/**
	 * Creates a new player break block signal.
	 * @param player The player breaking the block.
	 * @param itemStack The item stack that is being used to break the block, or null if empty hand.
	 */
	public constructor(
		block: Block,
		player: Player,
		itemStack: ItemStack | null
	) {
		super(block);
		this.player = player;
		this.itemStack = itemStack;
	}
}

export { PlayerBreakBlockSignal };
