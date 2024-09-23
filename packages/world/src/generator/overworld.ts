import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { BlockIdentifier, type BlockPermutation } from "@serenityjs/block";
//@ts-expect-error No Types but we are propably going to creaate ones one day
import fastnoise from "fastnoise-lite";

import { Chunk } from "../chunk";

import { TerrainGenerator } from "./generator";

import type { BlockPalette } from "../block";
import type { DimensionType } from "@serenityjs/protocol";

class Overworld extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "overworld";
	public readonly fast: fastnoise;
	public readonly fast2: fastnoise;
	public readonly spikes: fastnoise;
	public readonly worldNoise: NoiseFunction2D;
	public readonly foilageNoise: NoiseFunction2D;
	public readonly treeNoise: NoiseFunction2D;

	public readonly base: BlockPermutation;
	public readonly fill: Array<BlockPermutation>;
	public readonly top_layer: Array<BlockPermutation>;
	public readonly vegetation: Array<BlockPermutation>;
	//public readonly stone: BlockPermutation;
	public readonly dirt: BlockPermutation;
	public readonly water: BlockPermutation;
	public readonly oak_log: BlockPermutation;
	public readonly oak_leaves: BlockPermutation;
	public getPemutation(kinds: Array<BlockPermutation>): BlockPermutation {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return kinds[Math.floor(Math.random() * kinds.length)]!;
	}

	public constructor(palette: BlockPalette, seed: number) {
		super(palette, seed);

		this.worldNoise = createNoise2D(() => this.seed);
		this.foilageNoise = createNoise2D(() => this.seed * 0.1337);
		this.treeNoise = createNoise2D(() => this.seed * 0.925);

		this.base = this.palette.resolvePermutation(BlockIdentifier.Bedrock);
		this.fill = [
			this.palette.resolvePermutation(BlockIdentifier.Cobblestone),
			this.palette.resolvePermutation(BlockIdentifier.Cobblestone),
			this.palette.resolvePermutation(BlockIdentifier.Stone),
			this.palette.resolvePermutation(BlockIdentifier.Stone),
			this.palette.resolvePermutation(BlockIdentifier.MossyCobblestone),
			this.palette.resolvePermutation(BlockIdentifier.MossyCobblestone)
		];
		this.top_layer = [
			this.palette.resolvePermutation(BlockIdentifier.GrassBlock),
			this.palette.resolvePermutation(BlockIdentifier.GrassBlock),
			this.palette.resolvePermutation(BlockIdentifier.GrassBlock),
			this.palette.resolvePermutation(BlockIdentifier.MossBlock)
		];
		this.vegetation = [
			this.palette.resolvePermutation(BlockIdentifier.Cornflower),
			this.palette.resolvePermutation(BlockIdentifier.Poppy),
			this.palette.resolvePermutation(BlockIdentifier.RedTulip),
			this.palette.resolvePermutation(BlockIdentifier.WhiteTulip),
			this.palette.resolvePermutation(BlockIdentifier.RedTulip),
			this.palette.resolvePermutation(BlockIdentifier.TallGrass),
			this.palette.resolvePermutation(BlockIdentifier.TallGrass),
			this.palette.resolvePermutation(BlockIdentifier.TallGrass),
			this.palette.resolvePermutation(BlockIdentifier.TallGrass)
		];
		this.dirt = this.palette.resolvePermutation(BlockIdentifier.Dirt);
		this.water = this.palette.resolvePermutation(BlockIdentifier.Water);
		this.oak_log = this.palette.resolvePermutation(BlockIdentifier.OakLog);
		this.oak_leaves = this.palette.resolvePermutation(
			BlockIdentifier.OakLeaves
		);
		this.fast = new fastnoise(this.seed);
		this.fast.SetNoiseType(fastnoise.NoiseType.Perlin);
		this.fast.SetFractalOctaves(3);
		this.fast.SetFractalType(fastnoise.FractalType.FBm);

		this.fast2 = new fastnoise(this.seed);
		this.fast2.SetNoiseType(fastnoise.NoiseType.Perlin);
		this.fast2.SetFractalOctaves(3);
		this.fast2.SetFractalType(fastnoise.FractalType.FBm);
		this.fast2.SetFrequency(0.03);

		this.spikes = new fastnoise(this.seed);
		this.spikes.SetNoiseType(fastnoise.NoiseType.Cellular);
		this.spikes.SetCellularJitter(1);
		this.spikes.SetFrequency(0.003); //this.spikes.SetFrequency(0.02);
	}

	public getHeightMapIndex(x: number, z: number): number {
		return x + (z << 4);
	}

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		// Generate the chunk.
		const chunk = new Chunk(cx, cz, type);

		const zero = -64;
		const waterLevel = -18;

		// Prefetch height map, some of the values could be used more than 16*16 so we can fetch them and use them later
		const heightMap: { [k: number]: number } = {};
		const getHeight = (x: number, z: number) => {
			const index = x + (z << 5); //Hmm Ber care full x -> 16 == z -> 1, Thats why we can't use z << 4, but we have to use z << 5
			return (
				heightMap[index] ??
				(heightMap[index] = this.getHeight(x + (cx << 4), z + (cz << 4)))
			);
		};
		// Generate the terrain.
		for (let x = 0; x < 16; x++) {
			for (let z = 0, y = zero; z < 16; z++, y = zero) {
				const scale = getHeight(x, z);

				//Base world height
				const scaled = Math.floor(scale * 180);

				// Use to check for the angle of the terrain, for example when we are middle of the clift generatin this would be more height value
				// You can use it to cancel generation of tree on these kind of terrains
				const flatterLevel =
					((scale - getHeight(x + 1, z)) ** 2 +
						(scale - getHeight(x, z + 1)) ** 2) **
					0.5;

				// First Is Always Bedrock
				chunk.setPermutation({ x, y: y++, z }, this.base);

				//Fill Bunch of stones
				for (let _ = 0; _ < scaled; _++)
					chunk.setPermutation({ x, y: y++, z }, this.getPemutation(this.fill));

				//4 Layers of dirt
				//for (let _ = 0; _ < 4; _++) chunk.setPermutation({x, y++, z}, this.dirt);

				// Last Is Always Grass
				if (
					y >= waterLevel &&
					flatterLevel * (1 + (Math.random() - 0.5) * 0.7) < 0.007 //Be careful just a small change can change the world drasticly
				) {
					chunk.setPermutation(
						{ x, y: y++, z },
						this.getPemutation(this.top_layer)
					);
					if (Math.random() > 0.97)
						chunk.setPermutation(
							{ x, y: y++, z },
							this.getPemutation(this.vegetation)
						);

					// Tree Logic here
					// put ---->
					// here
					/////////////////////
					if (Math.random() < 0.006) this.placeFeature(chunk, x, z, y - 1);
				} else {
					chunk.setPermutation({ x, y: y++, z }, this.getPemutation(this.fill));
				}

				// If we are still too low, fill up the water tho
				for (; y <= waterLevel; y++)
					chunk.setPermutation({ x, y, z }, this.water);
			}
		}

		// Return the chunk.
		return chunk;
	}

	public placeFeature(chunk: Chunk, x: number, z: number, y: number): void {
		// Chunk if the tree has enought space in that chunk
		// There is no chunk cache implementation so for now this is the only way
		if (x < 3 || x > 13 || z < 3 || z > 13) return;
		chunk.setPermutation({ x, y: y + 1, z }, this.oak_log);
		chunk.setPermutation({ x, y: y + 2, z }, this.oak_log);
		chunk.setPermutation({ x, y: y + 3, z }, this.oak_log);
		chunk.setPermutation({ x, y: y + 4, z }, this.oak_log);

		// Layer 1
		chunk.setPermutation({ x, y: y + 4, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 4, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 4, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 4, z }, this.oak_leaves);

		chunk.setPermutation({ x: x + 1, y: y + 4, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 4, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 4, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 4, z: z - 1 }, this.oak_leaves);

		// Layer 2
		chunk.setPermutation({ x, y: y + 4, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 4, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 4, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 4, z }, this.oak_leaves);

		chunk.setPermutation({ x: x + 2, y: y + 4, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 4, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 4, z: z + 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x - 2, y: y + 4, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 4, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 4, z: z + 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x + 2, y: y + 4, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 4, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 4, z: z - 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x - 2, y: y + 4, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 4, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 4, z: z - 2 }, this.oak_leaves);

		// Layer 1
		chunk.setPermutation({ x, y: y + 5, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 5, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 5, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 5, z }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 5, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 5, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 5, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 5, z: z - 1 }, this.oak_leaves);

		// Layer 2
		chunk.setPermutation({ x, y: y + 5, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 5, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 5, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 5, z }, this.oak_leaves);

		chunk.setPermutation({ x: x + 2, y: y + 5, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 5, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 5, z: z + 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x - 2, y: y + 5, z: z + 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 5, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 5, z: z + 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x + 2, y: y + 5, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 2, y: y + 5, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 5, z: z - 2 }, this.oak_leaves);

		chunk.setPermutation({ x: x - 2, y: y + 5, z: z - 2 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 2, y: y + 5, z: z - 1 }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 5, z: z - 2 }, this.oak_leaves);

		// Layer 3
		chunk.setPermutation({ x, y: y + 6, z }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 6, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 6, z }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 6, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 6, z: z - 1 }, this.oak_leaves);

		chunk.setPermutation({ x, y: y + 7, z }, this.oak_leaves);
		chunk.setPermutation({ x: x + 1, y: y + 7, z }, this.oak_leaves);
		chunk.setPermutation({ x: x - 1, y: y + 7, z }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 7, z: z + 1 }, this.oak_leaves);
		chunk.setPermutation({ x, y: y + 7, z: z - 1 }, this.oak_leaves);
	}

	public static POWER_MAIN = 7;
	public static POWER_SPIKES = 5;
	public static POWER_SECOND = 2;
	// Make sure this is the right value for Gety method
	public static MAX_GENERATOR_HEIGHT =
		1 / (this.POWER_MAIN * 2 + this.POWER_SECOND + this.POWER_SPIKES * 2);

	//Implement more interesting shape here you can basicly combine some noises to gether via multiplication or addition
	//This method should always return in range of 0 to 1
	public getHeight(x: number, z: number): number {
		return (
			((this.fast.GetNoise(x, z) + 1) * Overworld.POWER_MAIN +
				(this.spikes.GetNoise(x, z) + 1) * Overworld.POWER_SPIKES + //0.3
				this.fast2.GetNoise(x, z) ** 2 * Overworld.POWER_SECOND) * //0.1
			//0.2
			Overworld.MAX_GENERATOR_HEIGHT
		);
	}
}

export { Overworld };

/* Original src Code

				for (let y = -64; y < height; y++) {
					if (y >= height - 4) {
						chunk.setPermutation(x, y, z, this.dirt);
					} else {
						chunk.setPermutation(x, y, z, this.stone);
					}
				}
				/*
				if (height < 0 - 1) {
					chunk.setPermutation(x, height, z, this.dirt);
				} else {
					chunk.setPermutation(x, height, z, this.grass);
				}
				/*
				if (height <= 0)
					for (let y = -64; y < 0; y++) {
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
					}*/
/*
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
						chunk.setPermutation(x, height + 1, z, this.oak_log);
						chunk.setPermutation(x, height + 2, z, this.oak_log);
						chunk.setPermutation(x, height + 3, z, this.oak_log);
						chunk.setPermutation(x, height + 4, z, this.oak_log);

						// Layer 1
						chunk.setPermutation(x, height + 4, z + 1, this.oak_leaves);
						chunk.setPermutation(x, height + 4, z - 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 4, z, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 4, z, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 4, z + 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 4, z + 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 4, z - 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 4, z - 1, this.oak_leaves);

						// Layer 2
						chunk.setPermutation(x, height + 4, z + 2, this.oak_leaves);
						chunk.setPermutation(x, height + 4, z - 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 4, z, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 4, z, this.oak_leaves);

						chunk.setPermutation(x + 2, height + 4, z + 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 4, z + 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 4, z + 2, this.oak_leaves);

						chunk.setPermutation(x - 2, height + 4, z + 2, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 4, z + 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 4, z + 2, this.oak_leaves);

						chunk.setPermutation(x + 2, height + 4, z - 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 4, z - 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 4, z - 2, this.oak_leaves);

						chunk.setPermutation(x - 2, height + 4, z - 2, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 4, z - 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 4, z - 2, this.oak_leaves);

						// Layer 1
						chunk.setPermutation(x, height + 5, z + 1, this.oak_leaves);
						chunk.setPermutation(x, height + 5, z - 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 5, z, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 5, z, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 5, z + 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 5, z + 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 5, z - 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 5, z - 1, this.oak_leaves);

						// Layer 2
						chunk.setPermutation(x, height + 5, z + 2, this.oak_leaves);
						chunk.setPermutation(x, height + 5, z - 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 5, z, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 5, z, this.oak_leaves);

						chunk.setPermutation(x + 2, height + 5, z + 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 5, z + 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 5, z + 2, this.oak_leaves);

						chunk.setPermutation(x - 2, height + 5, z + 2, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 5, z + 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 5, z + 2, this.oak_leaves);

						chunk.setPermutation(x + 2, height + 5, z - 2, this.oak_leaves);
						chunk.setPermutation(x + 2, height + 5, z - 1, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 5, z - 2, this.oak_leaves);

						chunk.setPermutation(x - 2, height + 5, z - 2, this.oak_leaves);
						chunk.setPermutation(x - 2, height + 5, z - 1, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 5, z - 2, this.oak_leaves);

						// Layer 3
						chunk.setPermutation(x, height + 6, z, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 6, z, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 6, z, this.oak_leaves);
						chunk.setPermutation(x, height + 6, z + 1, this.oak_leaves);
						chunk.setPermutation(x, height + 6, z - 1, this.oak_leaves);

						chunk.setPermutation(x, height + 7, z, this.oak_leaves);
						chunk.setPermutation(x + 1, height + 7, z, this.oak_leaves);
						chunk.setPermutation(x - 1, height + 7, z, this.oak_leaves);
						chunk.setPermutation(x, height + 7, z + 1, this.oak_leaves);
						chunk.setPermutation(x, height + 7, z - 1, this.oak_leaves);
					}
				}*/
