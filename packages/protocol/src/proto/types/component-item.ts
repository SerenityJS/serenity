import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";
import { DataType } from "@serenityjs/raknet";

class ComponentItem extends DataType {
	public readonly name: string;
	public readonly data: CompoundTag;

	public constructor(name: string, data: CompoundTag) {
		super();
		this.name = name;
		this.data = data;
	}

	public static read(stream: BinaryStream): Array<ComponentItem> {
		// Prepare the array to store the component items.
		const items: Array<ComponentItem> = [];

		// Read the number of items.
		const count = stream.readVarInt();

		// Iterate over the items.
		for (let index = 0; index < count; index++) {
			// Read the name of the item.
			const name = stream.readVarString();

			// Read the data of the item.
			const data = CompoundTag.read(stream);

			// Add the item to the array.
			items.push(new ComponentItem(name, data));
		}

		// Return the array of component items.
		return items;
	}

	public static write(stream: BinaryStream, value: Array<ComponentItem>): void {
		// Write the number of items.
		stream.writeVarInt(value.length);

		// Iterate over the items.
		for (const item of value) {
			// Write the name of the item.
			stream.writeVarString(item.name);

			// Write the data of the item.
			CompoundTag.write(stream, item.data);
		}
	}
}

export { ComponentItem };
