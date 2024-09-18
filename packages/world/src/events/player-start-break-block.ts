import { WorldEvent } from "../enums";

import { BlockUpdateSignal } from "./block-update";

import type { Block } from "../block";
import type { Player } from "../player";

class PlayerStartBreakBlockSignal extends BlockUpdateSignal {
	public static readonly identifier = WorldEvent.PlayerStartBreakBlock;

	/**
	 * The player placing the block.
	 */
	public readonly player: Player;

	/**
	 * Creates a new player start break block signal.
	 * @param player The player breaking the block.
	 */
	public constructor(block: Block, player: Player) {
		super(block);
		this.player = player;
	}
}

export { PlayerStartBreakBlockSignal };
