import { BlockIdentifier } from "@serenityjs/block";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { DimensionType } from "@serenityjs/protocol";

class End extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "end";

	public bedrock = this.palette.resolvePermutation(BlockIdentifier.Bedrock);
	public endstone = this.palette.resolvePermutation(BlockIdentifier.EndStone);

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		const chunk = new Chunk(cx, cz, type);

		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < 4; y++) {
					const position = { x, y, z };

					if (y === 0) {
						chunk.setPermutation(position, this.bedrock, false);
					} else {
						chunk.setPermutation(position, this.endstone, false);
					}
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { End };
