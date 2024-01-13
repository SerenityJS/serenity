import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { MoveMode } from '../enums';

interface TeleportCauseEntry {
	cause: number;
	sourceEntityType: number;
}

class TeleportCause extends DataType {
	public static override read(stream: BinaryStream, endian: Endianness, mode: MoveMode): TeleportCauseEntry | null {
		if (mode === MoveMode.Teleport) {
			const cause = stream.readInt32(endian);
			const sourceEntityType = stream.readInt32(endian);

			return {
				cause,
				sourceEntityType,
			};
		} else {
			return null;
		}
	}

	public static override write(
		stream: BinaryStream,
		value: TeleportCauseEntry,
		endian: Endianness,
		mode: MoveMode,
	): void {
		if (mode === MoveMode.Teleport) {
			stream.writeInt32(value.cause, endian);
			stream.writeInt32(value.sourceEntityType, endian);
		}
	}
}

export { TeleportCause, type TeleportCauseEntry };
