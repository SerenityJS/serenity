import {
	type NoiseFunction3D,
	createNoise2D,
	createNoise3D,
	type NoiseFunction2D
} from "simplex-noise";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

import { TerrainGenerator } from "./generator";
import { Simplex } from "./simplex";

import type { Chunk } from "../chunk";

class Overworld extends TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier = "overworld";

	public readonly solNoise: Simplex;
	public readonly cavNoise: Simplex;
	public readonly conNoise: Simplex;
	public readonly conPoints: Array<Array<number>> = [
		[-1, 50],
		[-0.9, 55],
		[0.2, 63],
		[0.5, 70],
		[0.9, 100],
		[1, 103]
	];

	public readonly weiNoise: Simplex;
	public readonly eroNoise: Simplex;

	public readonly bedrock: BlockPermutation;
	public readonly stone: BlockPermutation;
	public readonly dirt: BlockPermutation;
	public readonly grass: BlockPermutation;
	public readonly water: BlockPermutation;
	public readonly lava: BlockPermutation;
	public readonly tulip_pink: BlockPermutation;
	public readonly poppy: BlockPermutation;
	public readonly dandelion: BlockPermutation;
	public readonly cornflower: BlockPermutation;
	public readonly oak_log: BlockPermutation;
	public readonly oak_leaves: BlockPermutation;
	public readonly sponge: BlockPermutation;
	public readonly air: BlockPermutation;
	public readonly glass: BlockPermutation;

	public constructor() {
		super(69);

		Simplex.currentSeed = this.seed;

		this.solNoise = new Simplex({
			distrib: 1,
			scale: 0.03,
			octaves: 2,
			amplitude: 0.8,
			seed: this.seed
		});

		this.cavNoise = new Simplex({
			distrib: 1,
			scale: 0.03,
			octaves: 2,
			amplitude: 0.8,
			seed: this.seed
		});

		this.conNoise = new Simplex({
			distrib: 1,
			scale: 0.008,
			octaves: 4,
			amplitude: 0.8,
			seed: this.seed
		});

		this.weiNoise = new Simplex({
			distrib: 2,
			scale: 0.005,
			octaves: 3,
			amplitude: 0.8,
			seed: this.seed
		});

		this.eroNoise = new Simplex({
			distrib: 2,
			scale: 0.005,
			octaves: 2,
			amplitude: 0.8,
			seed: this.seed
		});

		// Create the noise functions.
		// this.solidNoise = createNoise3D(() => this.seed);
		// this.solidNoise2 = createNoise3D(() => this.seed * 0.02);
		// this.solidNoise3 = createNoise3D(() => this.seed * 0.06);

		// this.conNoise = createNoise2D(() => this.seed);
		// this.conNoise2 = createNoise2D(() => this.seed * 0.02);
		// this.conNoise3 = createNoise2D(() => this.seed * 0.06);

		// this.weiNoise = createNoise2D(() => this.seed);
		// this.weiNoise2 = createNoise2D(() => this.seed * 0.02);
		// this.weiNoise3 = createNoise2D(() => this.seed * 0.06);

		// this.eroNoise = createNoise2D(() => this.seed);
		// this.eroNoise2 = createNoise2D(() => this.seed * 0.02);

		this.bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
		this.stone = BlockPermutation.resolve(BlockIdentifier.Stone);
		this.dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
		this.grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock);
		this.water = BlockPermutation.resolve(BlockIdentifier.Water);
		this.lava = BlockPermutation.resolve(BlockIdentifier.Lava);
		this.tulip_pink = BlockPermutation.resolve(BlockIdentifier.YellowFlower, {
			flower_type: "tulip_pink"
		});
		this.poppy = BlockPermutation.resolve(BlockIdentifier.YellowFlower);
		this.dandelion = BlockPermutation.resolve(BlockIdentifier.YellowFlower);
		this.cornflower = BlockPermutation.resolve(BlockIdentifier.YellowFlower, {
			flower_type: "cornflower"
		});
		this.oak_log = BlockPermutation.resolve(BlockIdentifier.OakLog);
		this.oak_leaves = BlockPermutation.resolve(BlockIdentifier.OakLeaves);
		this.sponge = BlockPermutation.resolve(BlockIdentifier.Sponge);
		this.air = BlockPermutation.resolve(BlockIdentifier.Air);
		this.glass = BlockPermutation.resolve(BlockIdentifier.Glass);
	}

	/**
	 * Adds Octaves together since the library doesn't have octaves
	 *
	 */
	// private getSolidNoise(x: number, y: number, z: number): number {
	// 	return (
	// 		this.solidNoise(x * 0.003, y * 0.003, z * 0.003) +
	// 		this.solidNoise2(x * 0.06, y * 0.06, z * 0.06) +
	// 		this.solidNoise3(x * 0.02, y * 0.02, z * 0.02)
	// 	);
	// }

	// private getConNoise(x: number, z: number): number {
	// 	return (
	// 		this.conNoise(x * 0.0009, z * 0.0009) +
	// 		this.conNoise2(x * 0.0036, z * 0.0036) +
	// 		this.conNoise3(x * 0.0144, z * 0.0144)
	// 	);
	// }

	// private getEroNoise(x: number, z: number): number {
	// 	return (
	// 		this.eroNoise(x * 0.003, z * 0.003) + this.eroNoise2(x * 0.06, z * 0.06)
	// 	);
	// }

	// private getWeiNoise(x: number, z: number): number {
	// 	return (
	// 		this.weiNoise(x * 0.003, z * 0.003) +
	// 		this.weiNoise2(x * 0.06, z * 0.06) +
	// 		this.weiNoise3(x * 0.02, z * 0.02)
	// 	);
	// }

	private linearInturp(
		x: number,
		xm: number,
		xM: number,
		ym: number,
		yM: number
	) {
		return ym + ((x - xm) * (yM - ym)) / (xM - xm);
	}

	private spline(value: number, points: Array<Array<number>>): number {
		for (let index = 0; index < points.length - 1; index++) {
			const [x1, y1] = points[index] ?? [0, 0];
			const [x2, y2] = points[index + 1] ?? [0, 0];

			if (value >= (x1 ?? 0) && value <= (x2 ?? 0))
				return this.linearInturp(value, x1 ?? 0, x2 ?? 0, y1 ?? 0, y2 ?? 0);
		}

		return 0;
	}

	/**
	 * Generates a chunk.
	 *
	 */
	public apply(chunk: Chunk): Chunk {
		// Generate the chunk.

		// MOUNTAINS/WATER
		// for (let x = 0; x < 16; x++) {
		// 	for (let z = 0; z < 16; z++) {
		// 		const c = this.conNoise.noise(chunk.x * 16 + x, chunk.z * 16 + z);
		// 		const h = this.spline(c, this.conPoints);
		// 		for (let index = 0; index < h; index++) {
		// 			chunk.setPermutation(x, index, z, this.stone);
		// 		}
		//    // lava 55 so 56
		// 		if (h < 63) {
		// 			for (let index = h + 1; index < 63; index++) {
		// 				chunk.setPermutation(x, index, z, this.water);
		// 			}
		// 		}
		// 	}
		// }

		//Generate the terrain.
		// for (let x = 0; x < 16; x++) {
		// 	for (let z = 0; z < 16; z++) {
		// 		for (let y = 0; y < 128; y++) {
		// 			const s = this.solNoise.noise(chunk.x * 16 + x, y, chunk.z * 16 + z);
		// 			// if (chunk.x * 16 + x == 0 && chunk.z * 16 + z == 0) {
		// 			// 	if (y > 10) break;
		// 			// 	console.log(s);
		// 			// 	console.log(x, y, z, chunk.x * 16 + x, chunk.z * 16 + z);
		// 			// }
		// 			//if (s <= 0.2) chunk.setPermutation(x, y, z, this.air);
		// 			if (s > 0.3) chunk.setPermutation(x, y, z, this.sponge);
		// 		}
		// 		chunk.setPermutation(x, 0, z, this.bedrock);
		// 	}
		// }

		// for (let x = 0; x < 16; x++) {
		// 	for (let z = 0; z < 16; z++) {
		// 		for (let y = -64; y < 320; y++) {
		// 			chunk.setPermutation(x, y, z, this.air);
		// 		}
		// 		for (let y = -64; y < -35; y++) {
		// 			const s = Math.random();
		// 			if (s <= 0.5) chunk.setPermutation(x, y, z, this.stone);
		// 		}
		// 	}
		// }

		// Generate the caves.
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = -64; y < 10; y++) {
					let s = this.solNoise.noise(chunk.x * 16 + x, y, chunk.z * 16 + z);
					const c = this.cavNoise.noise(chunk.x * 16 + x, y, chunk.z * 16 + z);

					s += 0.0001 * y * y;
					if (s >= -0.4) {
						chunk.setPermutation(x, y, z, this.stone);
					}
					if (c >= -0.1 && c <= 0.1) chunk.setPermutation(x, y, z, this.air);
					if (chunk.getPermutation(x, y, z) == this.air && y < -54)
						chunk.setPermutation(x, y, z, this.lava);
					switch (y) {
						case -60: {
							if (
								this.solNoise.noise(
									(chunk.x * 16 + x) * 64,
									(chunk.z * 16 + z) * 64,
									y
								) >= 0.3
							)
								chunk.setPermutation(x, y, z, this.bedrock);
							break;
						}
						case -61: {
							if (
								this.solNoise.noise(
									(chunk.x * 16 + x) * 32,
									(chunk.z * 16 + z) * 32,
									y
								) >= 0
							)
								chunk.setPermutation(x, y, z, this.bedrock);
							break;
						}
						case -62: {
							if (
								this.solNoise.noise(
									(chunk.x * 16 + x) * 16,
									(chunk.z * 16 + z) * 16,
									y
								) >= -0.3
							)
								chunk.setPermutation(x, y, z, this.bedrock);
							break;
						}
					}
				}

				chunk.setPermutation(x, -63, z, this.bedrock);
				chunk.setPermutation(x, -64, z, this.bedrock);
			}
		}

		// console.log("chunk done");

		// Return the chunk.
		return chunk;
	}
}

export { Overworld };