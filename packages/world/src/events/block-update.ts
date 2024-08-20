import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension, World } from "../world";
import type { Block } from "../block";

class BlockUpdateSignal extends WorldEventSignal {
	public static readonly identifier: WorldEvent = WorldEvent.BlockUpdate;

	/**
	 * The block that was updated.
	 */
	public readonly block: Block;

	/**
	 * The dimension the block was updated in.
	 */
	public readonly dimension: Dimension;

	/**
	 * Creates a new block update signal.
	 * @param block The block that was updated.
	 * @param dimension The dimension the block was updated in.
	 */
	public constructor(block: Block) {
		super();
		this.block = block;
		this.dimension = block.dimension;
	}

	public getWorld(): World {
		return this.dimension.world;
	}
}

export { BlockUpdateSignal };
