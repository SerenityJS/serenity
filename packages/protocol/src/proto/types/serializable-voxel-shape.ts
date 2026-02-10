import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { SerializableCells } from "./serializable-cells";

class SerializableVoxelShape extends DataType {
  /**
   * Grid of cells representing solid and empty regions.
   */
  public cells: SerializableCells;

  /**
   * Cell boundaries along the X axis.
   */
  public xCoordinates: Array<number>;

  /**
   * Cell boundaries along the Y axis.
   */
  public yCoordinates: Array<number>;

  /**
   * Cell boundaries along the Z axis.
   */
  public zCoordinates: Array<number>;

  /**
   * Creates a new instance of SerializableVoxelShape.
   * @param cells Grid of cells representing solid and empty regions.
   * @param xCoordinates Cell boundaries along the X axis.
   * @param yCoordinates Cell boundaries along the Y axis.
   * @param zCoordinates Cell boundaries along the Z axis.
   */
  public constructor(
    cells: SerializableCells,
    xCoordinates: Array<number>,
    yCoordinates: Array<number>,
    zCoordinates: Array<number>
  ) {
    super();

    // Set properties
    this.cells = cells;
    this.xCoordinates = xCoordinates;
    this.yCoordinates = yCoordinates;
    this.zCoordinates = zCoordinates;
  }

  public static read(stream: BinaryStream): SerializableVoxelShape {
    // Read cells
    const cells = SerializableCells.read(stream);

    // Read X coordinates
    const xLength = stream.readVarInt();
    const xCoordinates: Array<number> = [];
    for (let i = 0; i < xLength; i++) {
      xCoordinates.push(stream.readFloat32(Endianness.Little));
    }

    // Read Y coordinates
    const yLength = stream.readVarInt();
    const yCoordinates: Array<number> = [];
    for (let i = 0; i < yLength; i++) {
      yCoordinates.push(stream.readFloat32(Endianness.Little));
    }

    // Read Z coordinates
    const zLength = stream.readVarInt();
    const zCoordinates: Array<number> = [];
    for (let i = 0; i < zLength; i++) {
      zCoordinates.push(stream.readFloat32(Endianness.Little));
    }

    // Return the instance
    return new this(cells, xCoordinates, yCoordinates, zCoordinates);
  }

  public static write(
    stream: BinaryStream,
    value: SerializableVoxelShape
  ): void {
    // Write cells
    SerializableCells.write(stream, value.cells);

    // Write X coordinates
    stream.writeVarInt(value.xCoordinates.length);
    for (const x of value.xCoordinates) {
      stream.writeFloat32(x);
    }

    // Write Y coordinates
    stream.writeVarInt(value.yCoordinates.length);
    for (const y of value.yCoordinates) {
      stream.writeFloat32(y);
    }

    // Write Z coordinates
    stream.writeVarInt(value.zCoordinates.length);
    for (const z of value.zCoordinates) {
      stream.writeFloat32(z);
    }
  }
}

export { SerializableVoxelShape };
