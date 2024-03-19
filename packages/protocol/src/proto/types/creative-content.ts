import { DataType } from "@serenityjs/raknet";

import { ItemLegacy } from "./item-legacy";

import type { BinaryStream } from "@serenityjs/binaryutils";

class CreativeItems extends DataType {
	public entryId: number;
	public item: ItemLegacy;

	public constructor(entryId: number, item: ItemLegacy) {
		super();
		this.entryId = entryId;
		this.item = item;
	}

	public static override read(stream: BinaryStream): Array<CreativeItems> {
		// Prepare an array to store the items.
		const items: Array<CreativeItems> = [];

		// Read the number of items.
		const amount = stream.readVarInt();

		// We then loop through the amount of items.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the item.
			const entryId = stream.readVarInt();
			const item = ItemLegacy.read(stream);

			// Push the item to the array.
			items.push(new CreativeItems(entryId, item));
		}

		// Return the items.
		return items;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<CreativeItems>
	): void {
		// Write the number of items given in the array.
		stream.writeVarInt(value.length);

		// Loop through the items.
		for (const item of value) {
			// Write the fields for the item.
			stream.writeVarInt(item.entryId);
			ItemLegacy.write(stream, item.item);
		}
	}
}

export { CreativeItems };
