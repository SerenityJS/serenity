import { BinaryStream } from "@serenityjs/binarystream";

import { Vector3f } from "./vector3f";

export class Vector3i extends Vector3f {
  /**
   * Reads a 3D vector from the stream.
   *
   * @param stream The stream to read from.
   * @returns The 3D vector that was read.
   */
  public static override read(stream: BinaryStream): Vector3i {
    // Reads a x, y, z float from the stream
    const x = stream.readInt8();
    const y = stream.readInt8();
    const z = stream.readInt8();

    // Returns the x, y, z float
    return new Vector3i(x, y, z);
  }

  /**
   * Writes a 3D vector to the stream.
   *
   * @param stream The stream to write to.
   * @param value The 3D vector to write.
   */
  public static override write(stream: BinaryStream, value: Vector3i): void {
    // Writes a x, y, z float to the stream
    stream.writeInt8(value.x);
    stream.writeInt8(value.y);
    stream.writeInt8(value.z);
  }
}
