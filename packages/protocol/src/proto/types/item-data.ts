import { Endianness } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binaryutils";

class ItemData extends DataType {
	public componentBased: boolean;
	public name: string;
	public networkId: number;

	public constructor(componentBased: boolean, name: string, networkId: number) {
		super();
		this.componentBased = componentBased;
		this.name = name;
		this.networkId = networkId;
	}

	public static override read(stream: BinaryStream): Array<ItemData> {
		// Prepare an array to store the data.
		const data: Array<ItemData> = [];

		// Read the number of data.
		const amount = stream.readVarInt();

		// We then loop through the amount of data.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the rule.
			const name = stream.readVarString();
			const networkId = stream.readInt16(Endianness.Little);
			const componentBased = stream.readBool();

			// Push the state to the array.
			data.push(new ItemData(componentBased, name, networkId));
		}

		// Return the data.
		return data;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<ItemData>
	): void {
		// Write the number of data given in the array.
		stream.writeVarInt(value.length);

		// Loop through the data.
		for (const state of value) {
			// Write the fields for the state.
			stream.writeVarString(state.name);
			stream.writeInt16(state.networkId, Endianness.Little);
			stream.writeBool(state.componentBased);
		}
	}
}

export { ItemData };
