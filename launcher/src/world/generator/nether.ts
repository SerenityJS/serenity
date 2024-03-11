import { BlockPermutation } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { BlockMapper, Chunk } from "../chunk";

export class NetherFlat extends TerrainGenerator {
	public readonly layersMetrix;
	public constructor(
		flatLayers: Array<BlockPermutation | Array<BlockPermutation>>
	) {
		super(0);
		this.layersMetrix = flatLayers.map((lay) =>
			Array.isArray(lay) ? lay : [lay]
		);
	}

	/**
	 * Generates a chunk.
	 *
	 */
	public apply(chunk: Chunk): Chunk {
		// Generate the chunk.
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < this.layersMetrix.length; y++) {
					const palette = this.layersMetrix[y]!;
					chunk.setPermutation(
						x,
						y - 64,
						z,
						palette[Math.floor(palette.length * Math.random())]!
					);
				}
			}
		}

		// Return the chunk.
		return chunk;
	}

	public static BasicFlat(_blockTypes: BlockMapper) {
		return new this([
			BlockPermutation.resolve("minecraft:bedrock")!,
			BlockPermutation.resolve("minecraft:netherrack")!,
			[
				BlockPermutation.resolve("minecraft:netherrack")!,
				BlockPermutation.resolve("minecraft:nether_gold_ore")!,
				BlockPermutation.resolve("minecraft:quartz_ore")!
			]
		]);
	}
}
