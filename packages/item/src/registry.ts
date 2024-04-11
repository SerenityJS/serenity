import { BinaryStream } from "@serenityjs/binarystream";
import { CREATIVE_CONTENT, ITEMDATA } from "@serenityjs/data";
import { CreativeItems, ItemData } from "@serenityjs/protocol";

import { ItemType } from "./type";
import { CreativeItem } from "./creative";

import type { ItemIdentifier } from "./enums";

// Create a new stream from the item data.
const dataStream = new BinaryStream(ITEMDATA);

// Read the item data from the stream.
const data = ItemData.read(dataStream);

// Iterate over the item data.
for (const item of data) {
	// Create the item type.
	const type = new ItemType(item.name as ItemIdentifier, item.networkId);

	// Add the item type to the map.
	ItemType.types.set(type.identifier, type);
}

// Create a new stream from the creative content.
const creativeStream = new BinaryStream(CREATIVE_CONTENT);

// Read the creative content from the stream.
const creative = CreativeItems.read(creativeStream);

// Iterate over the creative content.
for (const [index, item] of creative.entries()) {
	// Get the item type from the map.
	const type = [...ItemType.types.values()].find(
		(type) => type.network === item.network
	);

	// Check if the item type is valid.
	// If not, then continue to the next item.
	if (!type) continue;

	// Do to some reason, some items have an incorrect metadata value,
	// So we will generate our own.
	const metadata =
		index - creative.findIndex((index_) => index_.network === item.network);

	// Create a new item instance descriptor.
	item.metadata = metadata;
	item.networkBlockId = type.block?.permutations[metadata]?.network ?? 0;

	// Set the item in the registry.
	CreativeItem.items.set(index, new CreativeItem(type, metadata));
}
