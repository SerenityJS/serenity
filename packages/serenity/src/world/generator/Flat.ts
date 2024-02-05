import type { BlockMapper, Chunk } from '../chunk';
import { BlockPermutation } from '../chunk';
import { TerrainGenerator } from './Generator';

export class TerrainFlat extends TerrainGenerator {
	public readonly flatLayers;
	public constructor(flatLayers: BlockPermutation[]) {
		super(0);
		this.flatLayers = flatLayers;
	}
	/**
	 * Generates a chunk.
	 *
	 */
	public apply(chunk: Chunk): Chunk {
		// Generate the chunk.
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < this.flatLayers.length; y++) chunk.setPermutation(x, y, z, this.flatLayers[y]);
			}
		}

		// Return the chunk.
		return chunk;
	}
}
export class BetterFlat extends TerrainGenerator {
	public readonly layersMetrix;
	public constructor(flatLayers: (BlockPermutation | BlockPermutation[])[]) {
		super(0);
		this.layersMetrix = flatLayers.map((e) => (Array.isArray(e) ? e : [e]));
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
					const palette = this.layersMetrix[y];
					chunk.setPermutation(x, y - 64, z, palette[Math.floor(palette.length * Math.random())]);
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
	public static BasicFlat(blockTypes: BlockMapper) {
		return new this([
			BlockPermutation.resolve('minecraft:bedrock')!,
			[BlockPermutation.resolve('minecraft:stone')!, BlockPermutation.resolve('minecraft:cobblestone')!],
			[
				BlockPermutation.resolve('minecraft:dirt')!,
				BlockPermutation.resolve('minecraft:dirt', { dirt_type: 'coarse' })!,
			],
			[BlockPermutation.resolve('minecraft:dirt')!, BlockPermutation.resolve('minecraft:dirt')!],
			[
				BlockPermutation.resolve('minecraft:grass')!,
				BlockPermutation.resolve('minecraft:grass')!,
				BlockPermutation.resolve('minecraft:moss_block')!,
			],
		]);
	}
}
