import { BlockIdentifier } from "@serenityjs/block";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { DimensionType } from "@serenityjs/protocol";

class Nether extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "nether";

	public bedrock = this.palette.resolvePermutation(BlockIdentifier.Bedrock);

	public netherrack = this.palette.resolvePermutation(
		BlockIdentifier.Netherrack
	);

	public wartBlock = this.palette.resolvePermutation(
		BlockIdentifier.NetherWartBlock
	);

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		const chunk = new Chunk(cx, cz, type);

		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < 4; y++) {
					if (y === 0) {
						chunk.setPermutation(x, y, z, this.bedrock, false);
					} else {
						const random = Math.random();
						if (random < 0.9) {
							chunk.setPermutation(x, y, z, this.netherrack, false);
						} else {
							chunk.setPermutation(x, y, z, this.wartBlock, false);
						}
					}
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { Nether };
