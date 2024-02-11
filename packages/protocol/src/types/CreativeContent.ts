import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { ItemLegacy } from './ItemLegacy';

class CreativeItems extends DataType {
	public entryId: number;
	public item: ItemLegacy;

	public constructor(entryId: number, item: ItemLegacy) {
		super();
		this.entryId = entryId;
		this.item = item;
	}

	public static override read(stream: BinaryStream): CreativeItems[] {
		// Prepare an array to store the items.
		const items: CreativeItems[] = [];

		// Read the number of items.
		const amount = stream.readVarInt();

		// We then loop through the amount of items.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the item.
			const entryId = stream.readVarInt();
			const item = ItemLegacy.read(stream);

			// Push the item to the array.
			items.push(new CreativeItems(entryId, item));
		}

		// Return the items.
		return items;
	}

	public static override write(stream: BinaryStream, value: CreativeItems[]): void {
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
