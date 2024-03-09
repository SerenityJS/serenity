import type { BinaryStream, Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import type { ModalFormCanceledReason } from '../enums/index.js';

class ModalFormCanceled extends DataType {
	public static override read(
		stream: BinaryStream,
		_endian: Endianness,
		canceled: boolean,
	): ModalFormCanceledReason | null {
		// Check if the canceled is true.
		if (canceled) {
			// Read the id field.
			return stream.readUint8();
		} else {
			// Return null.
			return null;
		}
	}

	public static override write(
		stream: BinaryStream,
		value: ModalFormCanceledReason | null,
		_endian: Endianness,
		canceled: boolean,
	): void {
		// Check if the canceled is true.
		if (canceled) {
			// Write the id field.
			stream.writeUint8(value!);
		}
	}
}

export { ModalFormCanceled };
