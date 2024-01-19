import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { ItemLegacy, type ItemStackLegacy } from './ItemLegacy';

interface CreativeItem {
	entryId: number;
	item: ItemStackLegacy;
}

class CreativeItems extends DataType {
	public static override read(stream: BinaryStream): CreativeItem[] {
		// Prepare an array to store the items.
		const items: CreativeItem[] = [];

		// Read the number of items.
		const amount = stream.readVarInt();

		// We then loop through the amount of items.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the item.
			const entryId = stream.readVarInt();
			const item = ItemLegacy.read(stream);

			// Push the item to the array.
			items.push({
				entryId,
				item,
			});
		}

		// Return the items.
		return items;
	}

	public static override write(stream: BinaryStream, value: CreativeItem[]): void {
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

export { CreativeItems, type CreativeItem };
