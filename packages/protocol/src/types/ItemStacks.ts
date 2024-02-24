import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { Item } from './Item.js';

class ItemStacks extends DataType {
	public static override read(stream: BinaryStream): Item[] {
		// Prepare an array to store the stacks
		const stacks: Item[] = [];

		// Read the number of stacks
		const amount = stream.readVarInt();

		// We then loop through the amount of stacks
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read the item
			const item = Item.read(stream);

			// Push the item to the array
			stacks.push(item);
		}

		// Return the stacks
		return stacks;
	}

	public static override write(stream: BinaryStream, value: Item[]): void {
		// Write the number of stacks given in the array
		stream.writeVarInt(value.length);

		// Loop through the stacks
		for (const stack of value) {
			// Write the fields for the stack
			Item.write(stream, stack);
		}
	}
}

export { ItemStacks };
