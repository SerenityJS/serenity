import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT, NBTTag, BedrockNBT } from '@serenityjs/nbt';

class Mappings {
	public readonly blocks: Map<number, string> = new Map();

	public constructor() {
		// Create a new stream from the CANONICAL_BLOCK_STATES file
		const stream = new BinaryStream(CANONICAL_BLOCK_STATES);

		// Predefine the runtimeId
		let runtimeId = 0;

		// Loop through the blocks, reading their names and IDs
		do {
			// If next tag is not compoud, CANONICAL_BLOCK_STATES file could be corrupted
			if (CANONICAL_BLOCK_STATES[stream.offset] !== NBTTag.Compoud) break;

			// Read the tag
			const tag = LightNBT.ReadRootTag(stream) as {
				name: string;
				states: { [k: string]: number };
				version: number;
			};

			// Add the block to the map
			this.blocks.set(runtimeId++, tag.name);
		} while (!stream.cursorAtEnd());
	}

	public getBlockRuntimeId(name: string, index = 0): number | null {
		return [...this.blocks.entries()].filter(([, blockName]) => blockName === name)[index]?.[0] ?? null;
	}

	public getBlockName(runtimeId: number, index = 0): string | null {
		return [...this.blocks.entries()].filter(([id]) => id === runtimeId)[index]?.[1] ?? null;
	}
}

export { Mappings };
