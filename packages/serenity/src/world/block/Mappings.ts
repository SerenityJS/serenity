import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT, NBTTag } from '@serenityjs/nbt';

class Mappings {
	public readonly blocks: Map<number, string> = new Map();

	public constructor() {
		const strm = new BinaryStream(CANONICAL_BLOCK_STATES);
		// Construct the block mappings

		// Predefine the runtimeId
		let runtimeId = 0;

		// Loop through the blocks, reading their names and IDs
		do {
			// If next tag is not compoud, CANONICAL_BLOCK_STATES file could be corrupted
			if(CANONICAL_BLOCK_STATES[strm.offset] !== NBTTag.Compoud) break;
			// Read the tag
			const tag = LightNBT.ReadRootTag(strm) as {
				name: string;
				states: {[k: string]: number;};
				version: number;
			};
			// Get the name and ID
			// TODO: Handle the block states

			// Add the block to the map
			this.blocks.set(runtimeId++, tag.name);
		} while (!strm.cursorAtEnd());
	}

	public getBlockRuntimeId(name: string, index = 0): number | null {
		return [...this.blocks.entries()].filter(([, blockName]) => blockName === name)[index]?.[0] ?? null;
	}

	public getBlockName(runtimeId: number, index = 0): string | null {
		return [...this.blocks.entries()].filter(([id]) => id === runtimeId)[index]?.[1] ?? null;
	}
}

export { Mappings };
