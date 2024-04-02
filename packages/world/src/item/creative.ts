import { BinaryStream } from "@serenityjs/binarystream";
import { CREATIVE_CONTENT } from "@serenityjs/data";
import {
	CreativeItems,
	NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";

import { ItemType } from "./type";
import { ItemStack } from "./stack";

class CreativeContentRegistry {
	/**
	 * A collective map of creative items registered.
	 */
	public static readonly items: Map<number, ItemStack> = new Map();

	/**
	 * Creates a new creative content registry.
	 */
	public constructor() {
		// Create a new stream from the creative content.
		const creativeStream = new BinaryStream(CREATIVE_CONTENT);

		// Read the creative content from the stream.
		const creative = CreativeItems.read(creativeStream);

		// Iterate over the creative content.
		for (const [index, item] of creative.entries()) {
			// Get the item type from the map.
			const type = ItemType.resolveByNetwork(item.network);

			// Check if the item type is valid.
			// If not, then continue to the next item.
			if (!type) continue;

			// Do to some reason, some items have an incorrect metadata value,
			// So we will generate our own.
			const metadata =
				index - creative.findIndex((index_) => index_.network === item.network);

			// Push the metadata value to the item type.
			type.metadata.push(metadata);

			// Create a new item instance descriptor.
			item.metadata = metadata;
			item.blockRuntimeId = type.block?.permutations[metadata]?.hash ?? 0;

			// Set the item in the registry.
			CreativeContentRegistry.items.set(index, type.create(1, metadata));
		}
	}

	/**
	 * Gets the network instance of all the creative content.
	 * @returns The network instance of all the creative content.
	 */
	public getNetworkInstance(): Array<NetworkItemInstanceDescriptor> {
		return [...CreativeContentRegistry.items.values()].map((item) => ({
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			blockRuntimeId: item.type.block?.permutations[item.metadata]?.hash ?? 0
		}));
	}

	/**
	 * Registers a new item to the creative content.
	 * @param item The item to register.
	 */
	public register(type: ItemType): void {
		// Create a new item from the type.
		const item = type.create(1, 0);

		// Set the item in the registry.
		CreativeContentRegistry.items.set(CreativeContentRegistry.items.size, item);
	}

	/**
	 * Registers a new item to the creative content.
	 * @param item The item to register.
	 */
	public static register(type: ItemType): void {
		// Create a new item from the type.
		const item = type.create(1, 0);

		// Set the item in the registry.
		CreativeContentRegistry.items.set(CreativeContentRegistry.items.size, item);
	}
}

export { CreativeContentRegistry };
