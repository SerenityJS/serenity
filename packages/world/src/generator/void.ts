import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

import { TerrainGenerator } from "./generator";

import type { Chunk } from "../chunk";

class Void extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "void";

	public readonly bedrock: BlockPermutation;

	public constructor() {
		super(0);

		// Get the bedrock block permutation.
		this.bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
	}

	/**
	 * Generates a chunk.
	 *
	 */
	public apply(chunk: Chunk): Chunk {
		// Check if the chunk x & z are 0.
		if (chunk.x === 0 && chunk.z === 0) {
			// Set the center block to bedrock.
			chunk.setPermutation(0, 0, 0, this.bedrock, false);
		}

		// Return the chunk.
		return chunk;
	}
}

export { Void };
