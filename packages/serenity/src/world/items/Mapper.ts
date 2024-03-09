import { ITEM_STATES, CREATIVE_CONTENT } from '@serenityjs/bedrock-data';
import { Itemstates, CreativeItems } from '@serenityjs/bedrock-protocol';
import { BinaryStream } from '@serenityjs/binaryutils';
import type { World } from '../World.js';
import { BlockPermutation, BlockType } from '../chunk/index.js';
import { ItemType } from './Type.js';

class ItemMapper {
	/**
	 *  The mapped items.
	 */
	protected readonly items: Map<number, ItemType> = new Map();

	/**
	 * The world instance.
	 */
	protected readonly world: World;

	/**
	 * The runtime ID.
	 */
	protected RUNTIME_ID = 0;

	/**
	 * Constructs a new item mapper.
	 *
	 * @param world - The world instance.
	 */
	public constructor(world: World) {
		// Assign the world.
		this.world = world;

		// Read the states and content.
		const states = Itemstates.read(new BinaryStream(ITEM_STATES));
		const content = CreativeItems.read(new BinaryStream(CREATIVE_CONTENT));

		for (const entry of content) {
			// Find the item state.
			const state = states.find((x) => x.runtimeId === entry.item.networkId);

			// Check if the state is null.
			if (!state) continue;

			if (entry.item.blockRuntimeId === 0) {
				// Create the item type.
				const itemType = new ItemType(state.name, entry.item.metadata ?? 0, this.RUNTIME_ID++, entry.item.networkId);

				// Set the item type.
				this.items.set(itemType.runtimeId, itemType);
			} else {
				// Find any item types that have the same network ID.
				const types = [...this.items.values()].filter((x) => x.networkId === entry.item.networkId);

				// Get the permutation.
				const permutation =
					types.length > 0
						? types[0].permutation?.type.permutations[types.length]
						: BlockPermutation.resolve(state.name);

				// Create the item type.
				const itemType = new ItemType(
					state.name,
					entry.item.metadata ?? 0,
					this.RUNTIME_ID++,
					entry.item.networkId,
					permutation,
				);

				// Set the item type.
				this.items.set(itemType.runtimeId, itemType);
			}
		}

		ItemType.types = [...this.items.values()];
	}

	public getTypes(): ItemType[] {
		return [...this.items.values()];
	}

	public resolveType(identifier: string): ItemType | undefined {
		return [...this.items.values()].find((type) => type.identifier === identifier);
	}
}

export { ItemMapper };
