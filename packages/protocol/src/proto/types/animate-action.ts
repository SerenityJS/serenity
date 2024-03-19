import { Endianness } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

import { AnimateId } from "../../enums";

import type { BinaryStream } from "@serenityjs/binaryutils";

class AnimateAction extends DataType {
	public static override read(
		stream: BinaryStream,
		endian: Endianness,
		id: AnimateId
	): number | null {
		// Check if the id is RowRight or RowLeft.
		if (id === AnimateId.RowRight || id === AnimateId.RowLeft) {
			// Read the boat rowing time
			return stream.readFloat32(endian);
		}

		// Return null if the id is not RowRight or RowLeft.
		return null;
	}

	public static override write(
		stream: BinaryStream,
		value: number | null
	): void {
		// Check if the value is not null.
		if (value !== null) {
			// Write the boat rowing time.
			stream.writeFloat32(value, Endianness.Little);
		}
	}
}

export { AnimateAction };
