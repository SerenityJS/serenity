import { ChunkColumn } from '../chunk';
import { Generator } from './Generator';

/**
 * Represents a flat world generator.
 */
class Flat extends Generator {
	/**
	 * Generates a chunk.
	 *
	 * @param x The x coordinate of the chunk.
	 * @param z The z coordinate of the chunk.
	 */
	public override generateChunk(x: number, z: number): ChunkColumn {
		// Construct a new chunk column.
		const chunk = new ChunkColumn(x, z);

		const bedrock = this.world.mappings.getBlockRuntimeId('minecraft:bedrock')!;
		const glowingobsidian = this.world.mappings.getBlockRuntimeId('minecraft:glowingobsidian')!;
		const stone = this.world.mappings.getBlockRuntimeId('minecraft:stone')!;
		const dirt = this.world.mappings.getBlockRuntimeId('minecraft:dirt')!;
		const grass = this.world.mappings.getBlockRuntimeId('minecraft:grass')!;

		// Generate the chunk.
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				chunk.setBlock(x, 0, z, bedrock);
				chunk.setBlock(x, 1, z, glowingobsidian); // Glowing Obsidian
				chunk.setBlock(x, 2, z, stone); // Stone
				chunk.setBlock(x, 3, z, stone); // Stone
				chunk.setBlock(x, 4, z, dirt); // Dirt
				chunk.setBlock(x, 5, z, dirt); // Dirt
				chunk.setBlock(x, 6, z, grass); // Grass
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { Flat };
