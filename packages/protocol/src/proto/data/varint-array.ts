import { BinaryStream } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

function VarintArray<T extends typeof DataType>(type: T): T {
	type.read = (stream: BinaryStream) => {
		// Prepare the array
		const array: Array<unknown> = [];

		// Read the length of the array
		const length = stream.readVarInt();

		// Loop through the array
		for (let index = 0; index < length; index++) {
			// Read the value
			array.push(type.read(stream));
		}
	};

	return type;
}

export { VarintArray };
