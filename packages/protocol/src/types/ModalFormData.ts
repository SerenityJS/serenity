import type { BinaryStream, Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class ModalFormData extends DataType {
	public static override read(stream: BinaryStream, _endian: Endianness, response: boolean): string | null {
		// Check if the response is true.
		if (response) {
			// Read the id field.
			return stream.readVarString();
		} else {
			// Return null.
			return null;
		}
	}

	public static override write(
		stream: BinaryStream,
		value: string | null,
		_endian: Endianness,
		response: boolean,
	): void {
		// Check if the response is true.
		if (response) {
			// Write the id field.
			stream.writeVarString(value!);
		}
	}
}

export { ModalFormData };
