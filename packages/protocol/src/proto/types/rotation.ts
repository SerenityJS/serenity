import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Vector2f } from "./vector2f";
import { Vector3f } from "./vector3f";

class Rotation extends DataType {
  /**
   * The yaw of the vector.
   */
  public yaw: number;

  /**
   * The pitch of the vector.
   */
  public pitch: number;

  /**
   * The head yaw of the vector.
   */
  public headYaw: number;

  /**
   * Rotation
   *
   * @param yaw The yaw of the vector.
   * @param pitch The pitch of the vector.
   * @param headYaw The head yaw of the vector.
   */
  public constructor(yaw: number, pitch: number, headYaw: number) {
    super();
    this.yaw = yaw;
    this.pitch = pitch;
    this.headYaw = headYaw;
  }

  /**
   * Sets the coordinates of the 3D vector.
   * @param other The other 3D vector to set the coordinates to.
   */
  public set(other: Rotation): void {
    this.yaw = other.yaw;
    this.pitch = other.pitch;
    this.headYaw = other.headYaw;
  }

  /**
   * Floors the coordinates of the 3D vector.
   *
   * @returns The 3D vector with the coordinates floored.
   */
  public floor(): this {
    this.yaw = Math.floor(this.yaw);
    this.pitch = Math.floor(this.pitch);
    this.headYaw = Math.floor(this.headYaw);

    return this;
  }

  /**
   * Compares this rotation to another rotation.
   * @param other The other rotation to compare to.
   * @returns True if the rotations are equal, false otherwise.
   */
  public equals(other: Rotation): boolean {
    return (
      this.yaw === other.yaw &&
      this.pitch === other.pitch &&
      this.headYaw === other.headYaw
    );
  }

  /**
   * Converts the rotation to a vector3f.
   *
   * @returns The vector3f that was converted.
   */
  public static fromVector3f(vector: Vector3f): Rotation {
    const floor = vector.floor();

    return new Rotation(floor.x, floor.y, floor.z);
  }

  /**
   * Converts the rotation to a vector3f.
   *
   * @param rotation The rotation to convert.
   * @returns The vector3f that was converted.
   */
  public static toVector3f(rotation: Rotation): Vector3f {
    return new Vector3f(rotation.yaw, rotation.pitch, rotation.headYaw);
  }

  /**
   * Converts the rotation to a vector2f.
   *
   * @param vector The vector3f to convert.
   * @returns The vector2f that was converted.
   */
  public static fromVector2f(vector: Vector3f): Vector2f {
    return new Vector2f(vector.x, vector.y);
  }

  /**
   * Converts the rotation to a vector2f.
   *
   * @param rotation The rotation to convert.
   * @returns The vector2f that was converted.
   */
  public static toVector2f(rotation: Rotation): Vector2f {
    return new Vector2f(rotation.yaw, rotation.pitch);
  }

  /**
   * Reads a rotation from the stream.
   *
   * @param stream The stream to read from.
   * @returns The rotation that was read.
   */
  public static override read(stream: BinaryStream): Rotation {
    // Read a yaw, pitch, headYaw Int8 from the stream
    const yaw = stream.readInt8() * (360 / 256);
    const pitch = stream.readInt8() * (360 / 256);
    const headYaw = stream.readInt8() * (360 / 256);

    return new Rotation(yaw, pitch, headYaw);
  }

  /**
   * Writes a rotation to the stream.
   *
   * @param stream The stream to write to.
   * @param value The rotation to write.
   */
  public static override write(stream: BinaryStream, value: Rotation): void {
    stream.writeInt8(Math.floor(value.pitch / (360 / 256)));
    stream.writeInt8(Math.floor(value.headYaw / (360 / 256)));
    stream.writeInt8(Math.floor(value.yaw / (360 / 256)));
  }
}

export { Rotation };
