import { BinaryStream } from "@serenityjs/binaryutils";
import { CREATIVE_CONTENT, ITEMDATA } from "@serenityjs/data";
import {
	CreativeItems,
	ItemData,
	NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";

import { BlockType } from "../block";
import { BlockIdentifier, ItemIdentifier } from "../enums";
import { World } from "../world";

import { ItemType } from "./type";

// TODO: Rework the item registry

class ItemRegistry {
	protected readonly world: World;

	public readonly creative: Array<NetworkItemInstanceDescriptor> = [];

	public constructor(world: World) {
		this.world = world;

		// Read the items from the stream.
		const data = new BinaryStream(ITEMDATA);

		// Read the items from the stream.
		const items = ItemData.read(data);

		// Iterate over the items.
		for (const item of items) {
			// Check if the item type is already registered.
			if (ItemType.types.has(item.name)) continue;

			// Find a block type for the item.
			const block = BlockType.resolve(item.name as BlockIdentifier);

			// Create a new item type.
			const type = new ItemType(
				item.name as ItemIdentifier,
				item.networkId,
				block ? block.permutations : []
			);

			// Register the item type.
			ItemType.types.set(item.name, type);
		}

		// Create a new stream from the creative content.
		const content = CreativeItems.read(new BinaryStream(CREATIVE_CONTENT));
		// Iterate over the content.
		for (const descriptor of content) {
			// Find the item type for the descriptor.
			const type = ItemType.resolveByNetwork(descriptor.network);

			// TODO: Change this up, looks like a mess.
			// Assign our runtime identifier for block types.
			descriptor.blockRuntimeId =
				type.permutations && type.permutations.length > 0
					? world.provider.hashes
						? descriptor.blockRuntimeId
						: type.permutations[descriptor.metadata as number]?.runtime ?? 0
					: 0;

			// Push the item descriptor to the content.
			this.creative.push(descriptor);
		}
	}

	public static resolve(identifier: ItemIdentifier): ItemType {
		return ItemType.types.get(identifier)!;
	}

	public static resolveByRuntime(runtime: number): ItemType {
		return [...ItemType.types.values()].find(
			(type) => type.runtime === runtime
		)!;
	}

	public static resolveByNetwork(network: number): ItemType {
		return [...ItemType.types.values()].find(
			(type) => type.network === network
		)!;
	}
}

export { ItemRegistry };
