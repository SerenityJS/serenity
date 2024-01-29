import type { BlockPermutation , BlockTypes, Chunk } from '../chunk';
import { TerrainGenerator } from './Generator';

export class TerrainFlat extends TerrainGenerator {
	public readonly flatLayers;
	public constructor(flatLayers: BlockPermutation[]){
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
				for (let y = 0; y < this.flatLayers.length; y++) chunk.setBlock(x, y, z, this.flatLayers[y]);
			}
		}

		// Return the chunk.
		return chunk;
	}
}
export class BetterFlat extends TerrainGenerator{
	public readonly layersMetrix;
	public constructor(flatLayers: (BlockPermutation | BlockPermutation[])[]){
		super(0);
		this.layersMetrix = flatLayers.map(e=>Array.isArray(e)?e:[e]);
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
					chunk.setBlock(x, y - 64, z, palette[Math.floor(palette.length * Math.random())]);
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
	public static BasicFlat(blockTypes: BlockTypes){
		return new this([
			blockTypes.resolvePermutation("minecraft:bedrock"),
			[blockTypes.resolvePermutation("minecraft:dirt",{"dirt_type":"coarse"}),blockTypes.resolvePermutation("minecraft:dirt",{"dirt_type":"coarse"})],
			[blockTypes.resolvePermutation("minecraft:dirt"),blockTypes.resolvePermutation("minecraft:dirt",{"dirt_type":"coarse"})],
			[blockTypes.resolvePermutation("minecraft:dirt"),blockTypes.resolvePermutation("minecraft:dirt")],
			[blockTypes.resolvePermutation("minecraft:grass"),blockTypes.resolvePermutation("minecraft:grass"),blockTypes.resolvePermutation("minecraft:moss_block"),]
		]);
	}
}
