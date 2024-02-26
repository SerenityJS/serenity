import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

/**
 * A 3D vector with floating point precision.
 *
 */
class Vector3f extends DataType {
	/**
	 * The x coordinate of the vector.
	 */
	public x: number;

	/**
	 * The y coordinate of the vector.
	 */
	public y: number;

	/**
	 * The z coordinate of the vector.
	 */
	public z: number;

	/**
	 * Creates a new 3D vector.
	 *
	 * @param x The x coordinate of the vector.
	 * @param y The y coordinate of the vector.
	 * @param z The z coordinate of the vector.
	 */
	public constructor(x: number, y: number, z: number) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * Floors the coordinates of the 3D vector.
	 *
	 * @returns The 3D vector with the coordinates floored.
	 */
	public floor(): this {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);

		return this;
	}

	/**
	 * Reads a 3D vector from the stream.
	 *
	 * @param stream The stream to read from.
	 * @returns The 3D vector that was read.
	 */
	public static override read(stream: BinaryStream): Vector3f {
		// Reads a x, y, z float from the stream
		const x = stream.readFloat32(Endianness.Little);
		const y = stream.readFloat32(Endianness.Little);
		const z = stream.readFloat32(Endianness.Little);

		// Returns the x, y, z float
		return new Vector3f(x, y, z);
	}

	/**
	 * Writes a 3D vector to the stream.
	 *
	 * @param stream The stream to write to.
	 * @param value The 3D vector to write.
	 */
	public static override write(stream: BinaryStream, value: Vector3f): void {
		// Writes a x, y, z float to the stream
		stream.writeFloat32(value.x, Endianness.Little);
		stream.writeFloat32(value.y, Endianness.Little);
		stream.writeFloat32(value.z, Endianness.Little);
	}
}

export { Vector3f };
