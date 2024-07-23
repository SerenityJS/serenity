import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

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
	 * Rounds the coordinates of the 3D vector to the nearest whole number.
	 * @returns
	 */
	public round(): Vector3f {
		const x = Math.round(this.x);
		const y = Math.round(this.y);
		const z = Math.round(this.z);

		return new Vector3f(x, y, z);
	}

	/**
	 * Ceils the coordinates of the 3D vector.
	 * @returns The 3D vector with the coordinates ceiled.
	 */
	public ceil(): Vector3f {
		const x = Math.ceil(this.x);
		const y = Math.ceil(this.y);
		const z = Math.ceil(this.z);

		return new Vector3f(x, y, z);
	}

	/**
	 * Floors the coordinates of the 3D vector.
	 * @returns The 3D vector with the coordinates floored.
	 */
	public floor(): Vector3f {
		const x = Math.floor(this.x);
		const y = Math.floor(this.y);
		const z = Math.floor(this.z);

		return new Vector3f(x, y, z);
	}

	/**
	 * Adds another 3D vector to this 3D vector.
	 * @param other The other 3D vector to add.
	 * @returns The result of the addition.
	 */
	public add(other: Vector3f): Vector3f {
		return new Vector3f(this.x + other.x, this.y + other.y, this.z + other.z);
	}

	/**
	 * Subtracts another 3D vector from this 3D vector.
	 * @param other The other 3D vector to subtract.
	 * @returns The result of the subtraction.
	 */
	public subtract(other: Vector3f): Vector3f {
		return new Vector3f(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	/**
	 * Multiplies this 3D vector with a scalar.
	 * @param scalar The scalar to multiply with.
	 * @returns The result of the multiplication.
	 */
	public multiply(scalar: number): Vector3f {
		return new Vector3f(this.x * scalar, this.y * scalar, this.z * scalar);
	}

	/**
	 * Divides this 3D vector with a scalar.
	 * @param scalar The scalar to divide with.
	 * @returns The result of the division.
	 */
	public divide(scalar: number): Vector3f {
		return new Vector3f(this.x / scalar, this.y / scalar, this.z / scalar);
	}

	/**
	 * Calculates the dot product between this 3D vector and another 3D vector.
	 * @param other The other 3D vector to calculate the dot product with.
	 * @returns The result of the dot product.
	 */
	public dot(other: Vector3f): number {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}

	/**
	 * Calculates the cross product between this 3D vector and another 3D vector.
	 * @param other The other 3D vector to calculate the cross product with.
	 * @returns The result of the cross product.
	 */
	public cross(other: Vector3f): Vector3f {
		const x = this.y * other.z - this.z * other.y;
		const y = this.z * other.x - this.x * other.z;
		const z = this.x * other.y - this.y * other.x;

		return new Vector3f(x, y, z);
	}

	/**
	 * Calculates the length of this 3D vector.
	 * @returns The length of the 3D vector.
	 */
	public length(): number {
		return Math.hypot(this.x, this.y, this.z);
	}

	/**
	 * Normalizes this 3D vector.
	 * @returns The normalized 3D vector.
	 */
	public normalize(): Vector3f {
		const length = this.length();
		return new Vector3f(this.x / length, this.y / length, this.z / length);
	}

	/**
	 * Linearly interpolates between this 3D vector and another 3D vector.
	 * @param other The other 3D vector to interpolate with.
	 * @param t The interpolation factor.
	 * @returns The interpolated 3D vector.
	 */
	public lerp(other: Vector3f, t: number): Vector3f {
		return new Vector3f(
			this.x + (other.x - this.x) * t,
			this.y + (other.y - this.y) * t,
			this.z + (other.z - this.z) * t
		);
	}

	/**
	 * Spherically interpolates between this 3D vector and another 3D vector.
	 * @param other The other 3D vector to interpolate with.
	 * @param t The interpolation factor.
	 * @returns The interpolated 3D vector.
	 */
	public slerp(other: Vector3f, t: number): Vector3f {
		const dot = this.dot(other);
		const theta = Math.acos(dot);
		const sinTheta = Math.sin(theta);

		const a = Math.sin((1 - t) * theta) / sinTheta;
		const b = Math.sin(t * theta) / sinTheta;

		return this.multiply(a).add(other.multiply(b));
	}

	/**
	 * Returns a string representation of this 3D vector.
	 * @returns The string representation of this 3D vector.
	 */
	public equals(other: Vector3f): boolean {
		return this.x === other.x && this.y === other.y && this.z === other.z;
	}

	/**
	 * Gets the distance between this 3D vector and another 3D vector.
	 * @param other The other 3D vector to get the distance to.
	 * @returns The distance between the 3D vectors.
	 */
	public distance(other: Vector3f): number {
		return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
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
