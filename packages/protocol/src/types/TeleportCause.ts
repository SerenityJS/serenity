import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { MoveMode } from '../enums/index.js';

class TeleportCause extends DataType {
	public cause: number;
	public sourceEntityType: number;

	public constructor(cause: number, sourceEntityType: number) {
		super();
		this.cause = cause;
		this.sourceEntityType = sourceEntityType;
	}

	public static override read(stream: BinaryStream, endian: Endianness, mode: MoveMode): TeleportCause | null {
		if (mode === MoveMode.Teleport) {
			const cause = stream.readInt32(endian);
			const sourceEntityType = stream.readInt32(endian);

			return new TeleportCause(cause, sourceEntityType);
		} else {
			return null;
		}
	}

	public static override write(stream: BinaryStream, value: TeleportCause, endian: Endianness, mode: MoveMode): void {
		if (mode === MoveMode.Teleport) {
			stream.writeInt32(value.cause, endian);
			stream.writeInt32(value.sourceEntityType, endian);
		}
	}
}

export { TeleportCause };
