import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

import { TerrainGenerator } from "./generator";

import type { Chunk } from "../chunk";

class Overworld extends TerrainGenerator {
	public readonly worldNoise: NoiseFunction2D;
	public readonly foilageNoise: NoiseFunction2D;
	public readonly treeNoise: NoiseFunction2D;

	public readonly bedrock: BlockPermutation;
	public readonly stone: BlockPermutation;
	public readonly dirt: BlockPermutation;
	public readonly grass: BlockPermutation;
	public readonly water: BlockPermutation;
	public readonly tulip_pink: BlockPermutation;
	public readonly poppy: BlockPermutation;
	public readonly dandelion: BlockPermutation;
	public readonly cornflower: BlockPermutation;
	public readonly cherry_log: BlockPermutation;
	public readonly cherry_leaves: BlockPermutation;

	public constructor() {
		super(0);

		// Create the noise functions.
		this.worldNoise = createNoise2D(() => this.seed);
		this.foilageNoise = createNoise2D(() => this.seed * 0.1337);
		this.treeNoise = createNoise2D(() => this.seed * 0.925);

		this.bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
		this.stone = BlockPermutation.resolve(BlockIdentifier.Stone);
		this.dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
		this.grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock);
		this.water = BlockPermutation.resolve(BlockIdentifier.Water);
		this.tulip_pink = BlockPermutation.resolve(BlockIdentifier.YellowFlower, {
			flower_type: "tulip_pink"
		});
		this.poppy = BlockPermutation.resolve(BlockIdentifier.RedFlower);
		this.dandelion = BlockPermutation.resolve(BlockIdentifier.YellowFlower);
		this.cornflower = BlockPermutation.resolve(BlockIdentifier.RedFlower, {
			flower_type: "cornflower"
		});
		this.cherry_log = BlockPermutation.resolve(BlockIdentifier.CherryLog);
		this.cherry_leaves = BlockPermutation.resolve(BlockIdentifier.CherryLeaves);
	}

	/**
	 * Generates a chunk.
	 *
	 */
	public apply(chunk: Chunk): Chunk {
		// Generate the chunk.

		// Generate the terrain.
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				const height = Math.floor(
					60 +
						20 *
							this.worldNoise(
								(chunk.x * 16 + x) * 0.005,
								(chunk.z * 16 + z) * 0.005
							)
				);

				for (let y = 0; y < height; y++) {
					if (y >= height - 4) {
						chunk.setPermutation(x, y, z, this.dirt);
					} else {
						chunk.setPermutation(x, y, z, this.stone);
					}
				}

				if (height < 62 - 1) {
					chunk.setPermutation(x, height, z, this.dirt);
				} else {
					chunk.setPermutation(x, height, z, this.grass);
				}

				if (height <= 62)
					for (let y = 0; y < 62; y++) {
						if (
							chunk.getPermutation(x, y, z).type.identifier === "minecraft:air"
						) {
							chunk.setPermutation(x, y, z, this.water);
						}
					}
				else {
					const foliageMap = Math.floor(
						55 +
							20 *
								this.foilageNoise(
									(chunk.x * 16 + x) * 0.1,
									(chunk.z * 16 + z) * 0.1
								)
					);

					// TODO: Do this properly
					if (
						foliageMap > 60 &&
						foliageMap !== 67 &&
						foliageMap !== 72 &&
						foliageMap !== 78
					) {
						if (foliageMap < 65)
							chunk.setPermutation(x, height + 1, z, this.tulip_pink);
						else if (foliageMap < 70)
							chunk.setPermutation(x, height + 1, z, this.cornflower);
						else if (foliageMap < 75)
							chunk.setPermutation(x, height + 1, z, this.dandelion);
						else chunk.setPermutation(x, height + 1, z, this.poppy);
					}

					// We dont want trees next to each other
					const treeMap = Math.floor(
						55 +
							20 *
								this.treeNoise(
									(chunk.x * 16 + x) * 0.72,
									(chunk.z * 16 + z) * 0.72
								)
					);

					// random number between 0 and 10
					const random = Math.floor(Math.random() * 10);

					if (treeMap === 41 && random === 5) {
						chunk.setPermutation(x, height + 1, z, this.cherry_log);
						chunk.setPermutation(x, height + 2, z, this.cherry_log);
						chunk.setPermutation(x, height + 3, z, this.cherry_log);
						chunk.setPermutation(x, height + 4, z, this.cherry_log);

						// Layer 1
						chunk.setPermutation(x, height + 4, z + 1, this.cherry_leaves);
						chunk.setPermutation(x, height + 4, z - 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 4, z, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 4, z, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 4, z + 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 4, z + 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 4, z - 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 4, z - 1, this.cherry_leaves);

						// Layer 2
						chunk.setPermutation(x, height + 4, z + 2, this.cherry_leaves);
						chunk.setPermutation(x, height + 4, z - 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 4, z, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 4, z, this.cherry_leaves);

						chunk.setPermutation(x + 2, height + 4, z + 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 4, z + 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 4, z + 2, this.cherry_leaves);

						chunk.setPermutation(x - 2, height + 4, z + 2, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 4, z + 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 4, z + 2, this.cherry_leaves);

						chunk.setPermutation(x + 2, height + 4, z - 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 4, z - 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 4, z - 2, this.cherry_leaves);

						chunk.setPermutation(x - 2, height + 4, z - 2, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 4, z - 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 4, z - 2, this.cherry_leaves);

						// Layer 1
						chunk.setPermutation(x, height + 5, z + 1, this.cherry_leaves);
						chunk.setPermutation(x, height + 5, z - 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 5, z, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 5, z, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 5, z + 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 5, z + 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 5, z - 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 5, z - 1, this.cherry_leaves);

						// Layer 2
						chunk.setPermutation(x, height + 5, z + 2, this.cherry_leaves);
						chunk.setPermutation(x, height + 5, z - 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 5, z, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 5, z, this.cherry_leaves);

						chunk.setPermutation(x + 2, height + 5, z + 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 5, z + 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 5, z + 2, this.cherry_leaves);

						chunk.setPermutation(x - 2, height + 5, z + 2, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 5, z + 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 5, z + 2, this.cherry_leaves);

						chunk.setPermutation(x + 2, height + 5, z - 2, this.cherry_leaves);
						chunk.setPermutation(x + 2, height + 5, z - 1, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 5, z - 2, this.cherry_leaves);

						chunk.setPermutation(x - 2, height + 5, z - 2, this.cherry_leaves);
						chunk.setPermutation(x - 2, height + 5, z - 1, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 5, z - 2, this.cherry_leaves);

						// Layer 3
						chunk.setPermutation(x, height + 6, z, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 6, z, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 6, z, this.cherry_leaves);
						chunk.setPermutation(x, height + 6, z + 1, this.cherry_leaves);
						chunk.setPermutation(x, height + 6, z - 1, this.cherry_leaves);

						chunk.setPermutation(x, height + 7, z, this.cherry_leaves);
						chunk.setPermutation(x + 1, height + 7, z, this.cherry_leaves);
						chunk.setPermutation(x - 1, height + 7, z, this.cherry_leaves);
						chunk.setPermutation(x, height + 7, z + 1, this.cherry_leaves);
						chunk.setPermutation(x, height + 7, z - 1, this.cherry_leaves);
					}
				}

				chunk.setPermutation(x, 0, z, this.bedrock);
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { Overworld };
