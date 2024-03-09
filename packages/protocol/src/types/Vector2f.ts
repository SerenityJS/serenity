import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

/**
 * A 2D vector with floating point precision.
 *
 */
class Vector2f extends DataType {
	/**
	 * The x coordinate of the vector.
	 */
	public x: number;

	/**
	 * The y coordinate of the vector.
	 */
	public y: number;

	/**
	 * Creates a new 2D vector.
	 *
	 * @param x The x coordinate of the vector.
	 * @param y The y coordinate of the vector.
	 */
	public constructor(x: number, y: number) {
		super();
		this.x = x;
		this.y = y;
	}

	public static override read(stream: BinaryStream): Vector2f {
		// Reads a x & y float from the stream
		const x = stream.readFloat32(Endianness.Little);
		const y = stream.readFloat32(Endianness.Little);

		// Returns the x & y float
		return new Vector2f(x, y);
	}

	public static override write(stream: BinaryStream, value: Vector2f): void {
		// Writes a x & z float to the stream
		stream.writeFloat32(value.x, Endianness.Little);
		stream.writeFloat32(value.y, Endianness.Little);
	}
}

export { Vector2f };
