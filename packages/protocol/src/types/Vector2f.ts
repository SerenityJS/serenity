import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface Vec2f {
	x: number;
	z: number;
}

class Vector2f extends DataType {
	public static override read(stream: BinaryStream): Vec2f {
		// Reads a x & z float from the stream
		const x = stream.readFloat32(Endianness.Little);
		const z = stream.readFloat32(Endianness.Little);

		// Returns the x & z float
		return {
			x,
			z,
		};
	}

	public static override write(stream: BinaryStream, value: Vec2f): void {
		// Writes a x & z float to the stream
		stream.writeFloat32(value.x, Endianness.Little);
		stream.writeFloat32(value.z, Endianness.Little);
	}
}

export { Vector2f, type Vec2f };
