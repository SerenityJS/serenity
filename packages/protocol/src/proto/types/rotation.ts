import { DataType } from "@serenityjs/raknet";

import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

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
   * @param rot The 3D vector to set the coordinates to.
   * @param other The other 3D vector to set the coordinates to.
   */
  public static set(rot: Rotation, other: Rotation): void {
    rot.yaw = other.yaw;
    rot.pitch = other.pitch;
    rot.headYaw = other.headYaw;
  }

  /**
   * Floors the coordinates of the 3D vector.
   *
   * @returns The 3D vector with the coordinates floored.
   */
  public static floor(rot: Rotation): Rotation {
    rot.yaw = Math.floor(rot.yaw);
    rot.pitch = Math.floor(rot.pitch);
    rot.headYaw = Math.floor(rot.headYaw);

    return rot;
  }

  /**
   * Compares this rotation to another rotation.
   * @param other The other rotation to compare to.
   * @returns True if the rotations are equal, false otherwise.
   */
  public static equals(rot: Rotation, other: Rotation): boolean {
    return (
      rot.yaw === other.yaw &&
      rot.pitch === other.pitch &&
      rot.headYaw === other.headYaw
    );
  }

  /**
   * Converts the rotation to a vector3f.
   *
   * @returns The vector3f that was converted.
   */
  public static fromVector3f(vector: Vector3f): Rotation {
    const floor = Vector3f.floor(vector);

    return new Rotation(floor.x, floor.y, floor.z);
  }

  /**
   * Reads a rotation from the stream.
   *
   * @param stream The stream to read from.
   * @returns The rotation that was read.
   */
  public static override read(stream: BinaryStream): Rotation {
    // Read a yaw, pitch, headYaw byte from the stream
    const yaw = stream.readByte() * (360 / 256);
    const pitch = stream.readByte() * (360 / 256);
    const headYaw = stream.readByte() * (360 / 256);

    return new Rotation(yaw, pitch, headYaw);
  }

  /**
   * Writes a rotation to the stream.
   *
   * @param stream The stream to write to.
   * @param value The rotation to write.
   */
  public static override write(stream: BinaryStream, value: Rotation): void {
    stream.writeByte(Math.floor(value.pitch / (360 / 256)));
    stream.writeByte(Math.floor(value.headYaw / (360 / 256)));
    stream.writeByte(Math.floor(value.yaw / (360 / 256)));
  }
}

export { Rotation };
