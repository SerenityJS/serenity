//@ts-expect-error No Types but we are propably going to creaate ones one day
import fastnoise from "fastnoise-lite";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { DimensionType } from "@serenityjs/protocol";
import { BlockIdentifier, BlockPermutation } from "@serenityjs/block";

import { Chunk } from "../../chunk";
import { TerrainWorker, Worker } from "../worker";

import { Overworld } from "./generator";

@Worker(Overworld)
class OverworldWorker extends TerrainWorker {
	public static readonly path = __filename;

	public static POWER_MAIN = 7;
	public static POWER_SPIKES = 5;
	public static POWER_SECOND = 2;
	// Make sure this is the right value for Gety method
	public static MAX_GENERATOR_HEIGHT = 1 / (7 * 2 + 2 + 5 * 2);

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

	public constructor(seed: number) {
		super(seed, Overworld);

		this.worldNoise = createNoise2D(() => this.seed);
		this.foilageNoise = createNoise2D(() => this.seed * 0.1337);
		this.treeNoise = createNoise2D(() => this.seed * 0.925);

		this.base = BlockPermutation.resolve(BlockIdentifier.Bedrock);
		this.fill = [
			BlockPermutation.resolve(BlockIdentifier.Cobblestone),
			BlockPermutation.resolve(BlockIdentifier.Cobblestone),
			BlockPermutation.resolve(BlockIdentifier.Stone),
			BlockPermutation.resolve(BlockIdentifier.Stone),
			BlockPermutation.resolve(BlockIdentifier.MossyCobblestone),
			BlockPermutation.resolve(BlockIdentifier.MossyCobblestone)
		];
		this.top_layer = [
			BlockPermutation.resolve(BlockIdentifier.GrassBlock),
			BlockPermutation.resolve(BlockIdentifier.GrassBlock),
			BlockPermutation.resolve(BlockIdentifier.GrassBlock),
			BlockPermutation.resolve(BlockIdentifier.MossBlock)
		];
		this.vegetation = [
			BlockPermutation.resolve(BlockIdentifier.Cornflower),
			BlockPermutation.resolve(BlockIdentifier.Poppy),
			BlockPermutation.resolve(BlockIdentifier.RedTulip),
			BlockPermutation.resolve(BlockIdentifier.WhiteTulip),
			BlockPermutation.resolve(BlockIdentifier.RedTulip),
			BlockPermutation.resolve(BlockIdentifier.TallGrass),
			BlockPermutation.resolve(BlockIdentifier.TallGrass),
			BlockPermutation.resolve(BlockIdentifier.TallGrass),
			BlockPermutation.resolve(BlockIdentifier.TallGrass)
		];
		this.dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
		this.water = BlockPermutation.resolve(BlockIdentifier.Water);
		this.oak_log = BlockPermutation.resolve(BlockIdentifier.OakLog);
		this.oak_leaves = BlockPermutation.resolve(BlockIdentifier.OakLeaves);
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

	public getPemutation(kinds: Array<BlockPermutation>): BlockPermutation {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return kinds[Math.floor(Math.random() * kinds.length)]!;
	}

	public getHeightMapIndex(x: number, z: number): number {
		return x + (z << 4);
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

	//Implement more interesting shape here you can basicly combine some noises to gether via multiplication or addition
	//This method should always return in range of 0 to 1
	public getHeight(x: number, z: number): number {
		return (
			((this.fast.GetNoise(x, z) + 1) * OverworldWorker.POWER_MAIN +
				(this.spikes.GetNoise(x, z) + 1) * OverworldWorker.POWER_SPIKES + //0.3
				this.fast2.GetNoise(x, z) ** 2 * OverworldWorker.POWER_SECOND) * //0.1
			//0.2
			OverworldWorker.MAX_GENERATOR_HEIGHT
		);
	}
}

export { OverworldWorker };
