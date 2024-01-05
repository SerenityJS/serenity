import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface Vec3f {
	x: number;
	y: number;
	z: number;
}

class Vector3f extends DataType {
	public static override read(stream: BinaryStream): Vec3f {
		// Reads a x, y, z float from the stream
		const x = stream.readFloat32(Endianness.Little);
		const y = stream.readFloat32(Endianness.Little);
		const z = stream.readFloat32(Endianness.Little);

		// Returns the x, y, z float
		return {
			x,
			y,
			z,
		};
	}

	public static override write(stream: BinaryStream, value: Vec3f): void {
		// Writes a x, y, z float to the stream
		stream.writeFloat32(value.x, Endianness.Little);
		stream.writeFloat32(value.y, Endianness.Little);
		stream.writeFloat32(value.z, Endianness.Little);
	}
}

export { Vector3f, type Vec3f };
