import { BinaryStream, DataType } from "@serenityjs/binarystream";

class SerializableCells extends DataType {
  /**
   * Number of cells along the X axis.
   */
  public xSize: number;

  /**
   * Number of cells along the Y axis.
   */
  public ySize: number;

  /**
   * Number of cells along the Z axis.
   */
  public zSize: number;

  /**
   * Solid/empty state per cell.
   */
  public storage: Array<number>;

  /**
   * Creates a new instance of SerializableCells.
   * @param xSize Number of cells along the X axis.
   * @param ySize Number of cells along the Y axis.
   * @param zSize Number of cells along the Z axis.
   * @param storage Solid/empty state per cell.
   */
  public constructor(
    xSize: number,
    ySize: number,
    zSize: number,
    storage: Array<number>
  ) {
    super();

    // Set properties
    this.xSize = xSize;
    this.ySize = ySize;
    this.zSize = zSize;
    this.storage = storage;
  }

  public static read(stream: BinaryStream): SerializableCells {
    // Read sizes
    const xSize = stream.readUint8();
    const ySize = stream.readUint8();
    const zSize = stream.readUint8();

    // Read storage
    const length = stream.readVarInt();
    const storage: Array<number> = [];
    for (let i = 0; i < length; i++) {
      storage.push(stream.readUint8());
    }

    // Return the instance
    return new this(xSize, ySize, zSize, storage);
  }

  public static write(stream: BinaryStream, value: SerializableCells): void {
    // Write sizes
    stream.writeUint8(value.xSize);
    stream.writeUint8(value.ySize);
    stream.writeUint8(value.zSize);

    // Write storage
    stream.writeVarInt(value.storage.length);
    for (const cell of value.storage) {
      stream.writeUint8(cell);
    }
  }
}

export { SerializableCells };
