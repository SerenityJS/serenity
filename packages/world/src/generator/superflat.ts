import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { DimensionType } from "@serenityjs/protocol";

class Superflat extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "superflat";

	public constructor() {
		super(0);
	}

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		const chunk = new Chunk(cx, cz, type);

		const bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
		const dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
		const grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock);

		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = -64; y < -60; y++) {
					if (y === -64) {
						chunk.setPermutation(x, y, z, bedrock, false);
					} else if (y === -63 || y === -62) {
						chunk.setPermutation(x, y, z, dirt, false);
					} else {
						chunk.setPermutation(x, y, z, grass, false);
					}
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { Superflat };
