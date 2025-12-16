import { BinaryStream, DataType } from "@serenityjs/binarystream";

export class SubChunkRequestPositionOffset extends DataType {
  /**
   * The x offset of the subchunk request.
   */
  public readonly x: number;

  /**
   * The y offset of the subchunk request.
   */
  public readonly y: number;

  /**
   * The z offset of the subchunk request.
   */
  public readonly z: number;

  /**
   * Creates an instance of SubChunkRequestPositionOffset.
   * @param x
   * @param y
   * @param z
   */
  public constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static read(stream: BinaryStream): SubChunkRequestPositionOffset {
    // Read the x, y, and z offsets.
    const x = stream.readInt8();
    const y = stream.readInt8();
    const z = stream.readInt8();

    // Return a new instance of this class with the x, y, and z offsets.
    return new this(x, y, z);
  }

  public static write(
    stream: BinaryStream,
    value: SubChunkRequestPositionOffset
  ): void {
    // Write the x, y, and z offsets.
    stream.writeInt8(value.x);
    stream.writeInt8(value.y);
    stream.writeInt8(value.z);
  }
}
