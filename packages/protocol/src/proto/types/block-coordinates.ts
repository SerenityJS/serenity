import { DataType } from "@serenityjs/raknet";

import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

// This is a perfect example that Mojank has no idea what they are doing...

class BlockCoordinates extends DataType {
	public x: number;
	public y: number;
	public z: number;

	public constructor(x: number, y: number, z: number) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}

	public static read(stream: BinaryStream): BlockCoordinates {
		// Reads a x, y, z float from the stream
		const x = stream.readZigZag();
		let y = stream.readVarInt(); // WHY MOJANK
		const z = stream.readZigZag();

		// For some reason, the y value is signed, so we need to convert it to an unsigned value.
		// -1 starts at 4294967295 and goes down to 0
		y = 4_294_967_295 - 64 >= y ? y : y - 4_294_967_296;

		// Returns the x, y, z float
		return new BlockCoordinates(x, y, z);
	}

	public static write(stream: BinaryStream, value: BlockCoordinates): void {
		// Converts the y value to an unsigned value
		const y = value.y < 0 ? 4_294_967_296 + value.y : value.y;

		// Writes a x, y, z float to the stream
		stream.writeZigZag(value.x);
		stream.writeVarInt(y);
		stream.writeZigZag(value.z);
	}

	/**
	 * Converts a Vector3f to a BlockCoordinates
	 * @param vector - The Vector3f to convert
	 * @returns The converted BlockCoordinates
	 */
	public static fromVector3f(vector: Vector3f): BlockCoordinates {
		return new BlockCoordinates(
			Math.floor(vector.x),
			Math.floor(vector.y),
			Math.floor(vector.z)
		);
	}

	/**
	 * Converts the BlockCoordinates to a Vector3f
	 * @returns The converted Vector3f
	 */
	public static toVector3f(coordinates: BlockCoordinates): Vector3f {
		return new Vector3f(coordinates.x, coordinates.y, coordinates.z);
	}
}

export { BlockCoordinates };
