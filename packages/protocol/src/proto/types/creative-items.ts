import { DataType } from "@serenityjs/raknet";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

import type { BinaryStream } from "@serenityjs/binarystream";

class CreativeItems extends DataType {
	public static read(
		stream: BinaryStream
	): Array<NetworkItemInstanceDescriptor> {
		// Prepare an array to store the items.
		const items: Array<NetworkItemInstanceDescriptor> = [];

		// Read the number of items.
		const amount = stream.readVarInt();

		// We then loop through the amount of items.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the item.
			// We will ignore the entryId field.
			// This field really isnt needed, and we will handle it in the write method.
			const _value = stream.readVarInt();

			// Read the item.
			const item = NetworkItemInstanceDescriptor.read(stream);

			// Push the item to the array.
			items.push(item);
		}

		// Return the items.
		return items;
	}

	public static write(
		stream: BinaryStream,
		value: Array<NetworkItemInstanceDescriptor>
	): void {
		// Write the number of items given in the array.
		stream.writeVarInt(value.length);

		// Loop through the length of the items.
		for (const [index, element] of value.entries()) {
			// Write the entryId for the item.
			// We will just write the index of the item in the array.
			stream.writeVarInt(index);

			// Write the fields for the item.
			NetworkItemInstanceDescriptor.write(stream, element);
		}
	}
}

export { CreativeItems };
