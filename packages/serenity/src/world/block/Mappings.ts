import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import type { NbtTag, TagEntry } from '@serenityjs/nbt';
import { NamedBinaryTag } from '@serenityjs/nbt';

class Mappings {
	public readonly blocks: Map<number, string> = new Map();

	public constructor() {
		// Construct the block mappings
		const nbt = new NamedBinaryTag(CANONICAL_BLOCK_STATES, true);

		// Predefine the runtimeId
		let runtimeId = 0;

		// Loop through the blocks, reading their names and IDs
		do {
			// Read the tag
			const tag = nbt.readTag<NbtTag.Compound, string>();

			// Check if the tag is null
			if (tag === null) {
				break;
			}

			// Get the name and ID
			// TODO: Handle the block states
			const name = tag.value[0].value;
			const id = runtimeId++;

			// Add the block to the map
			this.blocks.set(id, name);
		} while (!nbt.cursorAtEnd());
	}

	public getBlockRuntimeId(name: string, index = 0): number | null {
		return [...this.blocks.entries()].filter(([, blockName]) => blockName === name)[index]?.[0] ?? null;
	}

	public getBlockName(runtimeId: number, index = 0): string | null {
		return [...this.blocks.entries()].filter(([id]) => id === runtimeId)[index]?.[1] ?? null;
	}
}

export { Mappings };
