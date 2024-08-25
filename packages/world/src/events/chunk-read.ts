import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension } from "../world";
import type { Chunk } from "../chunk";

class ChunkReadSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.ChunkRead;

	/**
	 * The chunk that was read.
	 */
	public readonly chunk: Chunk;

	/**
	 * The dimension the chunk belongs to.
	 */
	public readonly dimension: Dimension;

	/**
	 * Creates a new chunk read signal.
	 * @param chunk The chunk that was read.
	 * @param dimension The dimension the chunk belongs to.
	 */
	public constructor(chunk: Chunk, dimension: Dimension) {
		super(dimension.world);
		this.chunk = chunk;
		this.dimension = dimension;
	}
}

export { ChunkReadSignal };
