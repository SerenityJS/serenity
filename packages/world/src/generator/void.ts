import { BlockIdentifier } from "@serenityjs/block";
import { Vector3f, type DimensionType } from "@serenityjs/protocol";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

class Void extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "void";

	public bedrock = this.palette.resolvePermutation(BlockIdentifier.Bedrock);

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		// Create the chunk.
		const chunk = new Chunk(cx, cz, type);

		// Check if the chunk x & z are 0.
		if (chunk.x === 0 && chunk.z === 0) {
			// Set the center block to bedrock.
			chunk.setPermutation(new Vector3f(0, 0, 0), this.bedrock, false);
		}

		// Return the chunk.
		return chunk;
	}
}

export { Void };
