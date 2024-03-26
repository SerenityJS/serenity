import { BinaryStream } from "@serenityjs/binaryutils";
import { ITEMDATA } from "@serenityjs/data";
import { ItemData } from "@serenityjs/protocol";

import { ItemIdentifier } from "../enums";

import { ItemType } from "./type";
import { CustomItemType } from "./custom";

class ItemRegistry {
	public constructor() {
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
	}

	public resolve(identifier: ItemIdentifier): ItemType {
		return ItemType.types.get(identifier)!;
	}

	public resolveByNetwork(network: number): ItemType {
		for (const [_, type] of ItemType.types) {
			if (type.network === network) return type;
		}

		return ItemType.types.get("minecraft:air")!;
	}

	public getCustomItems(): Array<CustomItemType> {
		return [...ItemType.types.values()].filter(
			(type) => type instanceof CustomItemType
		) as Array<CustomItemType>;
	}
}

export { ItemRegistry };
