import { DataType } from "@serenityjs/raknet";

import type { BinaryStream, Endianness } from "@serenityjs/binaryutils";
import type { ModalFormCanceledReason } from "../../enums";

class ModalFormCanceled extends DataType {
	public static override read(
		stream: BinaryStream,
		_endian: Endianness,
		canceled: boolean
	): ModalFormCanceledReason | null {
		// Check if the canceled is true.
		return canceled ? stream.readUint8() : null;
	}

	public static override write(
		stream: BinaryStream,
		value: ModalFormCanceledReason | null,
		_endian: Endianness,
		canceled: boolean
	): void {
		// Check if the canceled is true.
		if (canceled) {
			// Write the id field.
			stream.writeUint8(value!);
		}
	}
}

export { ModalFormCanceled };
