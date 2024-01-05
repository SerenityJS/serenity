import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface BlockCoordinate {
	x: number;
	y: number;
	z: number;
}

class BlockCoordinates extends DataType {
	public static override read(stream: BinaryStream): BlockCoordinate {
		// Reads a x, y, z float from the stream
		const x = stream.readFloat32(Endianness.Little);
		const y = stream.readVarInt();
		const z = stream.readFloat32(Endianness.Little);

		// Returns the x, y, z float
		return {
			x,
			y,
			z,
		};
	}

	public static override write(stream: BinaryStream, value: BlockCoordinate): void {
		// Writes a x, y, z float to the stream
		stream.writeFloat32(value.x, Endianness.Little);
		stream.writeVarInt(value.y);
		stream.writeFloat32(value.z, Endianness.Little);
	}
}

export { BlockCoordinates, type BlockCoordinate };
