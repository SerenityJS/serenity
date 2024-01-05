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
		const x = stream.readZigZag();
		const y = stream.readVarInt();
		const z = stream.readZigZag();

		// Returns the x, y, z float
		return {
			x,
			y,
			z,
		};
	}

	public static override write(stream: BinaryStream, value: BlockCoordinate): void {
		// Writes a x, y, z float to the stream
		stream.writeZigZag(value.x);
		stream.writeVarInt(value.y);
		stream.writeZigZag(value.z);
	}
}

export { BlockCoordinates, type BlockCoordinate };
