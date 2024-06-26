import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { DimensionType } from "@serenityjs/protocol";

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

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		// Create the chunk.
		const chunk = new Chunk(cx, cz, type);

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
