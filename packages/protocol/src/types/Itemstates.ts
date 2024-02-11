import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

class Itemstates extends DataType {
	public componentBased: boolean;
	public name: string;
	public runtimeId: number;

	public constructor(componentBased: boolean, name: string, runtimeId: number) {
		super();
		this.componentBased = componentBased;
		this.name = name;
		this.runtimeId = runtimeId;
	}

	public static override read(stream: BinaryStream): Itemstates[] {
		// Prepare an array to store the states.
		const states: Itemstates[] = [];

		// Read the number of states.
		const amount = stream.readVarInt();

		// We then loop through the amount of states.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the rule.
			const name = stream.readVarString();
			const runtimeId = stream.readInt16(Endianness.Little);
			const componentBased = stream.readBool();

			// Push the state to the array.
			states.push(new Itemstates(componentBased, name, runtimeId));
		}

		// Return the states.
		return states;
	}

	public static override write(stream: BinaryStream, value: Itemstates[]): void {
		// Write the number of states given in the array.
		stream.writeVarInt(value.length);

		// Loop through the states.
		for (const state of value) {
			// Write the fields for the state.
			stream.writeVarString(state.name);
			stream.writeInt16(state.runtimeId, Endianness.Little);
			stream.writeBool(state.componentBased);
		}
	}
}

export { Itemstates };
