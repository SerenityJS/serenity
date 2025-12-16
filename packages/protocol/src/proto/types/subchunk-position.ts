import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { IPosition } from "../../types";

class SubChunkPosition extends DataType implements IPosition {
  /**
   * The x coordinate of the subchunk position.
   */
  public x: number;

  /**
   * The y coordinate of the subchunk position.
   */
  public y: number;

  /**
   * The z coordinate of the subchunk position.
   */
  public z: number;

  /**
   * Creates an instance of SubChunkPosition.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param z The z coordinate.
   */
  public constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static read(stream: BinaryStream): SubChunkPosition {
    // Read the x, y, and z coordinates of the block position.
    const x = stream.readZigZag();
    const y = stream.readZigZag();
    const z = stream.readZigZag();

    // Return a new instance of this class with the x, y, and z coordinates.
    return new this(x, y, z);
  }

  public static write(stream: BinaryStream, value: SubChunkPosition): void {
    // Write the x, y, and z coordinates of the block position.
    stream.writeZigZag(value.x);
    stream.writeZigZag(value.y);
    stream.writeZigZag(value.z);
  }
}

export { SubChunkPosition };
