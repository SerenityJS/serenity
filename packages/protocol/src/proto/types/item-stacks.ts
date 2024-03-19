import { DataType } from "@serenityjs/raknet";

import { Item } from "./item";

import type { BinaryStream } from "@serenityjs/binaryutils";

class ItemStacks extends DataType {
	public static override read(stream: BinaryStream): Array<Item> {
		// Prepare an array to store the stacks
		const stacks: Array<Item> = [];

		// Read the number of stacks
		const amount = stream.readVarInt();

		// We then loop through the amount of stacks
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read the item
			const item = Item.read(stream);

			// Push the item to the array
			stacks.push(item);
		}

		// Return the stacks
		return stacks;
	}

	public static override write(stream: BinaryStream, value: Array<Item>): void {
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
