import { DataType } from "@serenityjs/raknet";

import { Vector3f } from "./vector3f";

import type { IPosition } from "../../types";
import type { BinaryStream } from "@serenityjs/binarystream";

// This is a perfect example that Mojank has no idea what they are doing...

class BlockPosition extends DataType implements IPosition {
	public x: number;
	public y: number;
	public z: number;

	public constructor(x: number, y: number, z: number) {
		super();
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * Rounds the coordinates of the 3D position to the nearest whole number.
	 * @returns
	 */
	public round(): BlockPosition {
		const x = Math.round(this.x);
		const y = Math.round(this.y);
		const z = Math.round(this.z);

		return new BlockPosition(x, y, z);
	}

	/**
	 * Ceils the coordinates of the 3D position.
	 * @returns The 3D position with the coordinates ceiled.
	 */
	public ceil(): BlockPosition {
		const x = Math.ceil(this.x);
		const y = Math.ceil(this.y);
		const z = Math.ceil(this.z);

		return new BlockPosition(x, y, z);
	}

	/**
	 * Floors the coordinates of the 3D position.
	 * @returns The 3D position with the coordinates floored.
	 */
	public floor(): BlockPosition {
		const x = Math.floor(this.x);
		const y = Math.floor(this.y);
		const z = Math.floor(this.z);

		return new BlockPosition(x, y, z);
	}

	/**
	 * Adds another 3D position to this 3D position.
	 * @param other The other 3D position to add.
	 * @returns The result of the addition.
	 */
	public add(other: BlockPosition): BlockPosition {
		return new BlockPosition(
			this.x + other.x,
			this.y + other.y,
			this.z + other.z
		);
	}

	/**
	 * Subtracts another 3D position from this 3D position.
	 * @param other The other 3D position to subtract.
	 * @returns The result of the subtraction.
	 */
	public subtract(other: BlockPosition): BlockPosition {
		return new BlockPosition(
			this.x - other.x,
			this.y - other.y,
			this.z - other.z
		);
	}

	/**
	 * Multiplies this 3D position with a scalar.
	 * @param scalar The scalar to multiply with.
	 * @returns The result of the multiplication.
	 */
	public multiply(scalar: number): BlockPosition {
		return new BlockPosition(this.x * scalar, this.y * scalar, this.z * scalar);
	}

	/**
	 * Divides this 3D position with a scalar.
	 * @param scalar The scalar to divide with.
	 * @returns The result of the division.
	 */
	public divide(scalar: number): BlockPosition {
		return new BlockPosition(this.x / scalar, this.y / scalar, this.z / scalar);
	}

	/**
	 * Calculates the dot product between this 3D position and another 3D position.
	 * @param other The other 3D position to calculate the dot product with.
	 * @returns The result of the dot product.
	 */
	public dot(other: BlockPosition): number {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	/**
	 * Calculates the cross product between this 3D position and another 3D position.
	 * @param other The other 3D position to calculate the cross product with.
	 * @returns The result of the cross product.
	 */
	public cross(other: BlockPosition): BlockPosition {
		const x = this.y * other.z - this.z * other.y;
		const y = this.z * other.x - this.x * other.z;
		const z = this.x * other.y - this.y * other.x;

		return new BlockPosition(x, y, z);
	}

	/**
	 * Calculates the length of this 3D position.
	 * @returns The length of the 3D position.
	 */
	public length(): number {
		return Math.hypot(this.x, this.y, this.z);
	}

	/**
	 * Calculates the square length of this 3D position.
	 * @returns the square length of the 3D position.
	 */
	public lengthSqrt(): number {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	/**
	 * Normalizes this 3D position.
	 * @returns The normalized 3D position.
	 */
	public normalize(): BlockPosition {
		const length = this.length();
		return new BlockPosition(this.x / length, this.y / length, this.z / length);
	}

	/**
	 * Linearly interpolates between this 3D position and another 3D position.
	 * @param other The other 3D position to interpolate with.
	 * @param t The interpolation factor.
	 * @returns The interpolated 3D position.
	 */
	public lerp(other: BlockPosition, t: number): BlockPosition {
		return new BlockPosition(
			this.x + (other.x - this.x) * t,
			this.y + (other.y - this.y) * t,
			this.z + (other.z - this.z) * t
		);
	}

	/**
	 * Spherically interpolates between this 3D position and another 3D position.
	 * @param other The other 3D position to interpolate with.
	 * @param t The interpolation factor.
	 * @returns The interpolated 3D position.
	 */
	public slerp(other: BlockPosition, t: number): BlockPosition {
		const dot = this.dot(other);
		const theta = Math.acos(dot);
		const sinTheta = Math.sin(theta);

		const a = Math.sin((1 - t) * theta) / sinTheta;
		const b = Math.sin(t * theta) / sinTheta;

		return this.multiply(a).add(other.multiply(b));
	}

	/**
	 * Returns a string representation of this 3D position.
	 * @returns The string representation of this 3D position.
	 */
	public equals(other: BlockPosition): boolean {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}

	/**
	 * Gets the distance between this 3D position and another 3D position.
	 * @param other The other 3D position to get the distance to.
	 * @returns The distance between the 3D positions.
	 */
	public distance(other: BlockPosition): number {
		return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	/**
	 * Computes the absolute value of each coordinate of the 3D vector.
	 * @returnsthe absolute value of this 3D vector.
	 */
	public absolute(): BlockPosition {
		return new BlockPosition(
			Math.abs(this.x),
			Math.abs(this.y),
			Math.abs(this.z)
		);
	}

	public static read(stream: BinaryStream): BlockPosition {
		// Reads a x, y, z float from the stream
		const x = stream.readZigZag();
		let y = stream.readVarInt(); // WHY MOJANK
		const z = stream.readZigZag();

		// For some reason, the y value is signed, so we need to convert it to an unsigned value.
		// -1 starts at 4294967295 and goes down to 0
		y = 4_294_967_295 - 64 >= y ? y : y - 4_294_967_296;

		// Returns the x, y, z float
		return new BlockPosition(x, y, z);
	}

	public static write(stream: BinaryStream, value: BlockPosition): void {
		// Converts the y value to an unsigned value
		const y = value.y < 0 ? 4_294_967_296 + value.y : value.y;

		// Writes a x, y, z float to the stream
		stream.writeZigZag(value.x);
		stream.writeVarInt(y);
		stream.writeZigZag(value.z);
	}

	/**
	 * Converts a BlockPosition to a BlockPosition
	 * @param position - The BlockPosition to convert
	 * @returns The converted BlockPosition
	 */
	public static fromVector3f(position: Vector3f): BlockPosition {
		return new BlockPosition(
			Math.floor(position.x),
			Math.floor(position.y),
			Math.floor(position.z)
		);
	}

	/**
	 * Converts the BlockPosition to a BlockPosition
	 * @returns The converted BlockPosition
	 */
	public static toVector3f(coordinates: BlockPosition): Vector3f {
		return new Vector3f(coordinates.x, coordinates.y, coordinates.z);
	}
}

export { BlockPosition };
