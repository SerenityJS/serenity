import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { BlockPosition } from "./block-position";

import type { IPosition } from "../../types";
import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * A 3D vector with floating point precision.
 *
 */
class Vector3f extends DataType implements IPosition {
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
   * Sets the coordinates of the 3D vector.
   * @param other The other 3D vector to set the coordinates to.
   */
  public static set(vec3f: IPosition, other: IPosition): void {
    vec3f.x = other.x;
    vec3f.y = other.y;
    vec3f.z = other.z;
  }

  /**
   * Rounds the coordinates of the 3D vector to the nearest whole number.
   * @returns
   */
  public static round(vec3f: IPosition): Vector3f {
    const x = Math.round(vec3f.x);
    const y = Math.round(vec3f.y);
    const z = Math.round(vec3f.z);

    return new Vector3f(x, y, z);
  }

  /**
   * Ceils the coordinates of the 3D vector.
   * @returns The 3D vector with the coordinates ceiled.
   */
  public static ceil(vec3f: IPosition): Vector3f {
    const x = Math.ceil(vec3f.x);
    const y = Math.ceil(vec3f.y);
    const z = Math.ceil(vec3f.z);

    return new Vector3f(x, y, z);
  }

  /**
   * Floors the coordinates of the 3D vector.
   * @returns The 3D vector with the coordinates floored.
   */
  public static floor(vec3f: IPosition): Vector3f {
    const x = Math.floor(vec3f.x);
    const y = Math.floor(vec3f.y);
    const z = Math.floor(vec3f.z);

    return new Vector3f(x, y, z);
  }

  /**
   * Adds another 3D vector to another 3D vector.
   * @param other The other 3D vector to add.
   * @returns The result of the addition.
   */
  public static add(vec3f: IPosition, other: IPosition): Vector3f {
    return new Vector3f(
      vec3f.x + other.x,
      vec3f.y + other.y,
      vec3f.z + other.z
    );
  }

  /**
   * Subtracts another 3D vector from this 3D vector.
   * @param other The other 3D vector to subtract.
   * @returns The result of the subtraction.
   */
  public static subtract(vec3f: IPosition, other: IPosition): Vector3f {
    return new Vector3f(
      vec3f.x - other.x,
      vec3f.y - other.y,
      vec3f.z - other.z
    );
  }

  /**
   * Multiplies this 3D vector with a scalar.
   * @param scalar The scalar to multiply with.
   * @returns The result of the multiplication.
   */
  public static multiply(vec3f: IPosition, scalar: number): Vector3f {
    return new Vector3f(vec3f.x * scalar, vec3f.y * scalar, vec3f.z * scalar);
  }

  /**
   * Divides this 3D vector with a scalar.
   * @param scalar The scalar to divide with.
   * @returns The result of the division.
   */
  public static divide(vec3f: IPosition, scalar: number): Vector3f {
    return new Vector3f(vec3f.x / scalar, vec3f.y / scalar, vec3f.z / scalar);
  }

  /**
   * Calculates the dot product between this 3D vector and another 3D vector.
   * @param other The other 3D vector to calculate the dot product with.
   * @returns The result of the dot product.
   */
  public static dot(vec3f: IPosition, other: IPosition): number {
    return vec3f.x * other.x + vec3f.y * other.y + vec3f.z * other.z;
  }

  /**
   * Calculates the cross product between this 3D vector and another 3D vector.
   * @param other The other 3D vector to calculate the cross product with.
   * @returns The result of the cross product.
   */
  public static cross(vec3f: IPosition, other: IPosition): Vector3f {
    const x = vec3f.y * other.z - vec3f.z * other.y;
    const y = vec3f.z * other.x - vec3f.x * other.z;
    const z = vec3f.x * other.y - vec3f.y * other.x;

    return new Vector3f(x, y, z);
  }

  /**
   * Calculates the length of this 3D vector.
   * @returns The length of the 3D vector.
   */
  public static length(vec3f: IPosition): number {
    return Math.hypot(vec3f.x, vec3f.y, vec3f.z);
  }

  /**
   * Calculates the square length of this 3D vector.
   * @returns the square length of the 3D vector.
   */
  public static lengthSqrt(vec3f: IPosition): number {
    return vec3f.x * vec3f.x + vec3f.y * vec3f.y + vec3f.z * vec3f.z;
  }

  /**
   * Normalizes this 3D vector.
   * @returns The normalized 3D vector.
   */
  public static normalize(vec3f: Vector3f): Vector3f {
    const length = this.length(vec3f);
    return new Vector3f(vec3f.x / length, vec3f.y / length, vec3f.z / length);
  }

  /**
   * Linearly interpolates between this 3D vector and another 3D vector.
   * @param other The other 3D vector to interpolate with.
   * @param t The interpolation factor.
   * @returns The interpolated 3D vector.
   */
  public static lerp(vec3f: Vector3f, other: IPosition, t: number): Vector3f {
    return new Vector3f(
      vec3f.x + (other.x - vec3f.x) * t,
      vec3f.y + (other.y - vec3f.y) * t,
      vec3f.z + (other.z - vec3f.z) * t
    );
  }

  /**
   * Spherically interpolates between this 3D vector and another 3D vector.
   * @param other The other 3D vector to interpolate with.
   * @param t The interpolation factor.
   * @returns The interpolated 3D vector.
   */
  public static slerp(
    vec3f: Vector3f,
    other: Vector3f | BlockPosition,
    t: number
  ): Vector3f {
    const dot = this.dot(vec3f, other);
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);

    const a = Math.sin((1 - t) * theta) / sinTheta;
    const b = Math.sin(t * theta) / sinTheta;

    const m = this.multiply(vec3f, a);
    const n = this.multiply(other, b);

    return new Vector3f(m.x + n.x, m.y + n.y, m.z + n.z);
  }

  /**
   * Returns a string representation of this 3D vector.
   * @returns The string representation of this 3D vector.
   */
  public static equals(vec3f: Vector3f, other: IPosition): boolean {
    return vec3f.x === other.x && vec3f.y === other.y && vec3f.z === other.z;
  }

  /**
   * Gets the distance between this 3D vector and another 3D vector.
   * @param other The other 3D vector to get the distance to.
   * @returns The distance between the 3D vectors.
   */
  public static distance(vec3f: Vector3f, other: IPosition): number {
    return Math.hypot(vec3f.x - other.x, vec3f.y - other.y, vec3f.z - other.z);
  }

  /**
   * Gets the Manhattan distance between this 3D vector and another 3D vector.
   * The Manhattan distance is the sum of the absolute differences of their coordinates.
   *
   * @param other - The other 3D vector to get the distance to.
   * @returns The Manhattan distance between the 3D vectors.
   */
  public static distanceManhattan(vec3f: Vector3f, other: IPosition): number {
    return (
      Math.abs(vec3f.x - other.x) +
      Math.abs(vec3f.y - other.y) +
      Math.abs(vec3f.z - other.z)
    );
  }

  /**
   * Computes the absolute value of each coordinate of the 3D vector.
   * @returns the absolute value of this 3D vector.
   */
  public static absolute(vec3f: Vector3f): Vector3f {
    return new Vector3f(
      Math.abs(vec3f.x),
      Math.abs(vec3f.y),
      Math.abs(vec3f.z)
    );
  }

  /**
   * Checks if the 3D vector is zero.
   * @returns true if the 3D vector is zero, false otherwise.
   */
  public static isZero(vec3f: Vector3f): boolean {
    return (
      Math.abs(vec3f.x) < Number.EPSILON &&
      Math.abs(vec3f.y) < Number.EPSILON &&
      Math.abs(vec3f.z) < Number.EPSILON
    );
  }

  /**
   * Clones this 3D vector into a new 3D vector.
   * @returns The cloned 3D vector.
   */
  public static clone(vec3f: Vector3f): Vector3f {
    return new Vector3f(vec3f.x, vec3f.y, vec3f.z);
  }

  /**
   * Converts this array to a 3D vector.
   * @returns The 3D vector that was converted.
   */
  public static fromArray(
    array: [number, number, number] | Array<number>
  ): Vector3f {
    return new Vector3f(array[0], array[1], array[2]);
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
