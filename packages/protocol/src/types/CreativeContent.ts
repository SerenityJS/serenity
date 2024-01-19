import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { ItemLegacy, type ItemStackLegacy } from './ItemLegacy';

interface CreativeItem {
	entryId: number;
	item: ItemStackLegacy;
}

class CreativeItems extends DataType {
	public readonly items: ItemStackLegacy[] = [];
	public constructor(){ super(); }
	public static override read(stream: BinaryStream): CreativeItems {
		// Prepare an array to store the items.
		const data = new this();
		const items = data.items;
		// Read the number of items.
		const amount = stream.readVarInt();

		// We then loop through the amount of items.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the item.
			const entryId = stream.readVarInt();
			const item = ItemLegacy.read(stream);

			// Push the item to the array.
			items.push(item);
		}

		// Return the items.
		return data;
	}

	public static override write(stream: BinaryStream, value: CreativeItems): void {
		// Write the number of items given in the array.
		stream.writeVarInt(value.items.length);

		// Loop through the items.
		let entryId = 0;
		for (const item of value.items) {
			// Write the fields for the item.
			stream.writeVarInt(entryId++);
			ItemLegacy.write(stream, item);
		}
	}
	public add(item: ItemStackLegacy){
		this.items.push(item);
		return this;
	}
}

export { CreativeItems, type CreativeItem };
